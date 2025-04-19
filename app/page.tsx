'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Pencil, Trash2, Download } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  productName: string;
  orderLink: string;
  pricePaid: number;
  resellValue: number;
  profit: number;
  trackingNumber: string;
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editOrderLink, setEditOrderLink] = useState('');
  const [editPricePaid, setEditPricePaid] = useState('');
  const [editResellValue, setEditResellValue] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const productNameRef = useRef<HTMLInputElement>(null);
  const orderLinkRef = useRef<HTMLInputElement>(null);
  const pricePaidRef = useRef<HTMLInputElement>(null);
  const resellValueRef = useRef<HTMLInputElement>(null);
  const trackingNumberRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('labubuOrders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('labubuOrders', JSON.stringify(orders));
  }, [orders]);

  const getFormattedTimestamp = () => {
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const year = now.getFullYear();

    return `${month}-${day}-${year}_${hours}:${minutes}:${seconds}`;
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const productName = productNameRef.current?.value.trim() || '';
    const orderLink = orderLinkRef.current?.value.trim() || '';
    const pricePaid = parseFloat(pricePaidRef.current?.value || '0');
    const resellValue = parseFloat(resellValueRef.current?.value || '0');
    const trackingNumber = trackingNumberRef.current?.value.trim() || '';
    if (!productName || !orderLink) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      productName,
      orderLink,
      pricePaid,
      resellValue,
      profit: resellValue - pricePaid,
      trackingNumber,
    };
    setOrders(prev => [...prev, newOrder]);

    // Clear inputs
    productNameRef.current!.value = '';
    orderLinkRef.current!.value = '';
    pricePaidRef.current!.value = '';
    resellValueRef.current!.value = '';
    trackingNumberRef.current!.value = '';
    setIsAddModalOpen(false);
  };

  const handleEdit = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    setEditingOrderId(id);
    setEditProductName(order.productName);
    setEditOrderLink(order.orderLink);
    setEditPricePaid(order.pricePaid.toString());
    setEditResellValue(order.resellValue.toString());
    setEditTrackingNumber(order.trackingNumber);
    setIsModalOpen(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingOrderId) return;
    setOrders(prev =>
      prev.map(o =>
        o.id === editingOrderId
          ? {
            ...o,
            productName: editProductName,
            orderLink: editOrderLink,
            pricePaid: parseFloat(editPricePaid),
            resellValue: parseFloat(editResellValue),
            profit: parseFloat(editResellValue) - parseFloat(editPricePaid),
            trackingNumber: editTrackingNumber,
          }
          : o
      )
    );
    setIsModalOpen(false);
    setEditingOrderId(null);
  };

  const handleExport = async () => {
    if (!tableRef.current) return;
    // Dynamically import jsPDF and AutoTable
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    // Create PDF document
    const doc = new jsPDF('p', 'pt', 'a4');
    // Optional: add a title
    doc.setFontSize(18);
    doc.text('Labubu Orders', 40, 40);
    // Generate table from HTML
    const tableElement = document.getElementById('orders-table') as HTMLTableElement;
    // Clone table and remove actions column for export
    const cloneTable = tableElement.cloneNode(true) as HTMLTableElement;
    cloneTable.querySelectorAll('.actions-col').forEach(el => el.remove());
    autoTable(doc, {
      html: cloneTable,
      startY: 60,
      theme: 'striped',
      headStyles: { fillColor: [248, 250, 252], textColor: [75, 85, 99], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 },
    });
    // Save the PDF
    const fileName = "labubu-orders_" + getFormattedTimestamp() + ".pdf";
    alert(fileName)
    doc.save(fileName);
  };

  const handleDelete = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className='flex flex-col gap-4 px-4 py-5 mb-6 backdrop-blur-lg bg-[#ffffff90] rounded-xl border-3 border-[#ffffff80]'>
          <h1 className="text-4xl font-extrabold text-gray-800 text-center">Labubu Order Tracker</h1>
          <button className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out hover:scale-105 text-white font-medium rounded-lg py-3 px-6 shadow" onClick={() => setIsAddModalOpen(true)}>
            New Order
          </button>
        </div>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm bg-[#17171710] flex items-center justify-center animate-fadeInUp">
            <div className="backdrop-blur-8xl bg-white/85 border-4 border-white shadow-[#17171799] shadow-2xl rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">New Order</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  ref={productNameRef}
                  type="text"
                  placeholder="Product Name"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  ref={orderLinkRef}
                  type="url"
                  placeholder="Order Link"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  ref={trackingNumberRef}
                  type="text"
                  placeholder="Tracking Number"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  ref={pricePaidRef}
                  type="number"
                  step="0.01"
                  placeholder="Price Paid"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  ref={resellValueRef}
                  type="number"
                  step="0.01"
                  placeholder="Resell Value"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out hover:scale-105 text-white font-medium rounded-lg py-2 px-4 shadow"
                  >
                    Add Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* <button
          onClick={handleExport}
          className="mb-6 bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out text-white rounded-lg py-3 px-6 shadow"
        >
          Export PDF
        </button> */}
        <div ref={tableRef} className="relative z-0 overflow-x-auto shadow-lg rounded-lg w-full">
          <table id="orders-table" className="w-full table-auto border-collapse backdrop-blur-md bg-[#ffffff99] rounded-xl border-3 border-[#ffffff]">
            <thead className='bg-[#fefefe99]'>
              <tr className='text-sm font-bold text-gray-800 uppercase'>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Price Paid</th>
                <th className="px-4 py-3">Resell Value</th>
                <th className="px-4 py-3">Profit</th>
                <th className="px-4 py-3">Tracking Number</th>
                <th className="px-4 py-3 actions-col">
                  <button className="bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out hover:scale-105 text-white rounded-lg shadow p-[.5rem]" onClick={handleExport} title='Download PDF'>
                    <span className="sr-only">Export PDF</span>
                    <Download size={18} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-600/8 transition-colors duration-300 text-center">
                  <td className="px-4 py-3 text-gray-600 border-[#ffffff] border-t-0 border-b-0">
                    <Link className="text-blue-500 hover:underline" href={order.orderLink} rel="noopener noreferrer" target="_blank">
                      {order.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 border-[#ffffff] border-t-0 border-b-0">${order.pricePaid.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 border-[#ffffff] border-t-0 border-b-0">${order.resellValue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 border-[#ffffff] border-t-0 border-b-0">${order.profit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 border-[#ffffff] border-t-0 border-b-0">
                    <a
                      href={`https://parcelsapp.com/en/tracking/${order.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {order.trackingNumber}
                    </a>
                  </td>
                  <td className="flex flex-row items-center gap-1 w-fit pt-[.8rem] text-gray-600 border-[#ffffff] actions-col">
                    <button className="w-fit mx-auto p-[.5rem] text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all duration-300 ease-in-out hover:scale-105" onClick={() => handleEdit(order.id)}>
                      <span className="sr-only">Edit</span>
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="w-fit mx-auto p-[.5rem] text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-300 ease-in-out hover:scale-105"
                    >
                      <span className="sr-only">Delete</span>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm bg-[#17171710] flex items-center justify-center animate-fadeInUp">
            <div className="backdrop-blur-2xl bg-white/80 border-4 border-white shadow-xlg rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Order</h2>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <input
                  type="text"
                  value={editProductName}
                  onChange={e => setEditProductName(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={editOrderLink}
                  onChange={e => setEditOrderLink(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={editTrackingNumber}
                  onChange={e => setEditTrackingNumber(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={editPricePaid}
                  onChange={e => setEditPricePaid(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={editResellValue}
                  onChange={e => setEditResellValue(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingOrderId(null); }}
                    className="px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out hover:scale-105 text-white font-medium rounded-lg py-2 px-4 shadow"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}