'use client';

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Phone,
  RefreshCw,
  CornerDownRight,
  Plus,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface SystemMessage {
  id: number;
  sender_type: 'user' | 'admin';
  sender_name: string;
  contact: string;
  subject: string;
  message: string;
  is_read: number;
  reply?: string;
  created_at: string;
  replied_at?: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // New announcement modal
  const [modalOpen, setModalOpen] = useState(false);
  const [annSubject, setAnnSubject] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/messages');
      setMessages(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await fetchApi(`/messages/${id}/read`, { method: 'PATCH' });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: 1 } : m))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      await fetchApi(`/messages/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply: replyText }),
      });
      setReplyText('');
      setReplyingId(null);
      loadMessages();
    } catch (err: any) {
      alert('ส่งการตอบกลับไม่สำเร็จ: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบข้อความนี้หรือไม่?')) return;
    try {
      await fetchApi(`/messages/${id}`, { method: 'DELETE' });
      loadMessages();
    } catch (err: any) {
      alert('ลบไม่สำเร็จ: ' + err.message);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/messages', {
        method: 'POST',
        body: JSON.stringify({
          sender_name: 'ผู้ดูแลระบบ (Admin)',
          contact: 'Airlink Management',
          subject: annSubject,
          message: annMessage,
        }),
      });
      setModalOpen(false);
      setAnnSubject('');
      setAnnMessage('');
      loadMessages();
    } catch (err: any) {
      alert('โพสต์ประกาศไม่สำเร็จ: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">กล่องข้อความ & แจ้งปัญหา (Support Messages)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            รับข้อความแจ้งปัญหาจากลูกค้า Hotspot และส่งประกาศข่าวสารลงหน้าล็อกอิน
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadMessages}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างข้อความประกาศ</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {messages.map((m) => {
          const isUnread = m.is_read === 0;

          return (
            <div
              key={m.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition ${
                isUnread ? 'border-sky-300 ring-1 ring-sky-100 bg-sky-50/20' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      m.sender_type === 'admin'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-sky-100 text-sky-600'
                    }`}
                  >
                    {m.sender_type === 'admin' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800">{m.subject}</h3>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-white">
                          ใหม่
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">{m.sender_name}</span>
                      {m.contact && <span>โทร: {m.contact}</span>}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(m.created_at).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(m.id)}
                      className="text-xs text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded-md hover:bg-sky-50 transition"
                    >
                      ทำเครื่องหมายอ่านแล้ว
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="mt-3 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                {m.message}
              </div>

              {/* Existing Reply */}
              {m.reply && (
                <div className="mt-3 pl-4 border-l-2 border-sky-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>คำตอบจากผู้ดูแลระบบ ({m.replied_at ? new Date(m.replied_at).toLocaleString('th-TH') : ''})</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
                    {m.reply}
                  </p>
                </div>
              )}

              {/* Reply Box */}
              {replyingId === m.id ? (
                <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="พิมพ์ข้อความตอบกลับลูกค้า..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => handleSendReply(m.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
                    >
                      ส่งคำตอบ
                    </button>
                  </div>
                </div>
              ) : (
                !m.reply && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        setReplyingId(m.id);
                        setReplyText('');
                        handleMarkRead(m.id);
                      }}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700 py-1 px-2.5 rounded-md hover:bg-sky-50 transition"
                    >
                      ตอบกลับข้อความ
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}

        {messages.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่มีข้อความใหม่</p>
            <p className="text-xs text-slate-400 mt-1">กล่องข้อความว่างเปล่า</p>
          </div>
        )}
      </div>

      {/* Modal Announcement */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">สร้างข้อความประกาศ</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อประกาศ*</label>
                <input
                  type="text"
                  required
                  value={annSubject}
                  onChange={(e) => setAnnSubject(e.target.value)}
                  placeholder="เช่น ปิดปรับปรุงระบบคืนนี้ หรือ โปรโมชั่นปีใหม่"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เนื้อหาประกาศ*</label>
                <textarea
                  rows={4}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="ระบุรายละเอียดข้อความ..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
                >
                  โพสต์ประกาศ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
