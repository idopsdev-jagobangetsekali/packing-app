'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [showNikInput, setShowNikInput] = useState(true)
  const [nik, setNik] = useState('')
  const [user, setUser] = useState(null)
  const [showPackingModal, setShowPackingModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showCaseModal, setShowCaseModal] = useState(false)
  const [dashboardData, setDashboardData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Cek apakah user sudah login sebelumnya
  useEffect(() => {
    const savedNik = localStorage.getItem('userNik')
    if (savedNik) {
      cekUser(savedNik)
    }
  }, [])

  // Fungsi untuk cek user berdasarkan NIK
  async function cekUser(nik) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('nik', nik)
      .single()

    if (data) {
      setUser(data)
      setNik(nik)
      setShowNikInput(false)
      localStorage.setItem('userNik', nik)
      loadDashboard()
    } else {
      alert('NIK tidak ditemukan!')
    }
  }

  // Fungsi untuk load dashboard
  async function loadDashboard() {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      setDashboardData(data)
    }
    setLoading(false)
  }

  // Real-time update
  useEffect(() => {
    const channel = supabase
      .channel('activities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          loadDashboard()
        }
      )
      .subscribe()

    return () => channel.unsubscribe()
  }, [])

  // Filter dashboard berdasarkan search
  const filteredData = dashboardData.filter(item => 
    item.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Tampilan login NIK
  if (showNikInput) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', textAlign: 'center' }}>
            MASUKKAN NIK
          </h2>
          <input
            type="text"
            placeholder="NIK..."
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '24px',
              border: '2px solid #ddd',
              borderRadius: '10px',
              marginBottom: '20px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && cekUser(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => cekUser(document.querySelector('input').value)}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            LOGIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER dengan LOGO */}
      <div style={{
        background: '#FFD700',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <img 
          src="https://drive.google.com/thumbnail?id=14qmr2WcqqboR8M7vDd3jKArlJxgtxaU-&sz=w1000"
          alt="MR.DIY"
          style={{ maxHeight: '150px', objectFit: 'contain' }}
        />
      </div>

      {/* INFO USER */}
      <div style={{
        background: 'white',
        padding: '10px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {user?.nama} - Team: {user?.team} (NIK: {nik})
      </div>

      {/* DASHBOARD */}
      <div style={{
        background: 'white',
        margin: '20px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        {/* Header Dashboard */}
        <div style={{
          background: '#FF8C00',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h3 style={{ fontSize: '32px', color: 'white', margin: 0 }}>
            RECENT ACTIVITY
          </h3>
          
          {/* Search Box */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Cari team/barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 20px',
                fontSize: '20px',
                borderRadius: '30px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                width: '300px'
              }}
            />
            <button
              onClick={loadDashboard}
              style={{
                padding: '10px 20px',
                fontSize: '20px',
                borderRadius: '30px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ↻ REFRESH
            </button>
          </div>
        </div>

        {/* Tabel Dashboard */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', position: 'sticky', top: 0 }}>
                <th style={{ padding: '15px', fontSize: '20px' }}>NO</th>
                <th style={{ padding: '15px', fontSize: '20px' }}>UNIQUE</th>
                <th style={{ padding: '15px', fontSize: '20px' }}>TEAM</th>
                <th style={{ padding: '15px', fontSize: '20px' }}>START</th>
                <th style={{ padding: '15px', fontSize: '20px' }}>FINISH</th>
                <th style={{ padding: '15px', fontSize: '20px' }}>TYPE</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontSize: '18px' }}>{index + 1}</td>
                  <td style={{ padding: '12px', fontSize: '18px' }}>{item.barcode || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '18px' }}>{item.team || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '18px' }}>
                    {item.type === 'START' ? new Date(item.created_at).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '18px' }}>
                    {item.type === 'FINISH' ? new Date(item.created_at).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '18px' }}>
                    <span style={{
                      background: item.type === 'START' ? '#28a745' : '#ffc107',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}>
                      {item.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOMBOL ACTION */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        padding: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowPackingModal(true)}
          style={{
            flex: '1',
            minWidth: '300px',
            background: '#FF8C00',
            color: 'white',
            padding: '40px 30px',
            fontSize: '40px',
            border: 'none',
            borderRadius: '60px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          START / FINISH
        </button>

        <button
          onClick={() => setShowIssueModal(true)}
          style={{
            flex: '1',
            minWidth: '300px',
            background: '#FF8C00',
            color: 'white',
            padding: '40px 30px',
            fontSize: '40px',
            border: 'none',
            borderRadius: '60px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          INPUT ISSUE
        </button>

        <button
          onClick={() => setShowCaseModal(true)}
          style={{
            flex: '1',
            minWidth: '300px',
            background: '#FF8C00',
            color: 'white',
            padding: '40px 30px',
            fontSize: '40px',
            border: 'none',
            borderRadius: '60px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          CASE IN AREA
        </button>
      </div>

      {/* MODAL PACKING */}
      {showPackingModal && (
        <PackingModal 
          onClose={() => setShowPackingModal(false)} 
          user={user}
        />
      )}

      {/* MODAL ISSUE */}
      {showIssueModal && (
        <IssueModal 
          onClose={() => setShowIssueModal(false)} 
          user={user}
        />
      )}

      {/* MODAL CASE */}
      {showCaseModal && (
        <CaseModal 
          onClose={() => setShowCaseModal(false)} 
          user={user}
        />
      )}
    </div>
  )
}

// MODAL PACKING
function PackingModal({ onClose, user }) {
  const [mode, setMode] = useState('select') // select, start, finish
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (!barcode) return alert('Scan barcode dulu!')
    
    setLoading(true)
    const { error } = await supabase
      .from('packing_sessions')
      .insert([{
        team: user.team,
        barcode: barcode,
        type: 'START',
        nik: user.nik,
        nama: user.nama,
        timestamp: new Date().toISOString()
      }])

    if (!error) {
      await supabase
        .from('activities')
        .insert([{
          type: 'START',
          team: user.team,
          barcode: barcode,
          details: { nik: user.nik, nama: user.nama }
        }])
      alert('START SUCCESS!')
      setBarcode('')
      setMode('select')
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  async function handleFinish() {
    if (!barcode) return alert('Scan barcode dulu!')
    
    setLoading(true)
    const { error } = await supabase
      .from('packing_sessions')
      .insert([{
        team: user.team,
        barcode: barcode,
        type: 'FINISH',
        nik: user.nik,
        nama: user.nama,
        timestamp: new Date().toISOString()
      }])

    if (!error) {
      await supabase
        .from('activities')
        .insert([{
          type: 'FINISH',
          team: user.team,
          barcode: barcode,
          details: { nik: user.nik, nama: user.nama }
        }])
      alert('FINISH SUCCESS!')
      setBarcode('')
      setMode('select')
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        width: '90%',
        maxWidth: '800px',
        borderRadius: '30px',
        padding: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '40px', margin: 0 }}>PACKING</h2>
          <button onClick={onClose} style={{ fontSize: '50px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        {mode === 'select' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>Team: {user.team}</label>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button
                onClick={() => setMode('start')}
                style={{
                  flex: 1,
                  padding: '30px',
                  fontSize: '40px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >
                START
              </button>
              <button
                onClick={() => setMode('finish')}
                style={{
                  flex: 1,
                  padding: '30px',
                  fontSize: '40px',
                  background: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >
                FINISH
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              background: '#f0f0f0',
              padding: '20px',
              borderRadius: '20px',
              textAlign: 'center',
              fontSize: '40px',
              marginBottom: '30px'
            }}>
              {mode === 'start' ? 'START MODE' : 'FINISH MODE'} - Team: {user.team}
            </div>

            <input
              type="text"
              placeholder="Scan barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '40px',
                border: '3px solid #007bff',
                borderRadius: '20px',
                marginBottom: '20px'
              }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMode('select')}
                style={{
                  flex: 1,
                  padding: '20px',
                  fontSize: '30px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                Kembali
              </button>
              <button
                onClick={mode === 'start' ? handleStart : handleFinish}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '20px',
                  fontSize: '30px',
                  background: mode === 'start' ? '#28a745' : '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'PROSES...' : 'SUBMIT'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// MODAL ISSUE (sederhana dulu)
function IssueModal({ onClose, user }) {
  const [form, setForm] = useState({
    whs: '',
    ibDate: '',
    storeFrom: '',
    store: '',
    invoice: '',
    rackZone: '',
    skuSticker: '',
    status: '',
    qtySticker: '',
    qtyActual: '',
    namaPIC: '',
    remarks: ''
  })

  async function handleSubmit() {
    const { error } = await supabase
      .from('issues')
      .insert([{
        ...form,
        timestamp: new Date().toISOString(),
        nama_pic: user.nama,
        qty_sticker: parseInt(form.qtySticker) || 0,
        qty_actual: parseInt(form.qtyActual) || 0
      }])

    if (!error) {
      alert('Issue saved!')
      onClose()
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        width: '95%',
        maxWidth: '800px',
        borderRadius: '30px',
        padding: '30px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '40px', margin: 0 }}>INPUT ISSUE</h2>
          <button onClick={onClose} style={{ fontSize: '50px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          <input
            placeholder="WHS *"
            value={form.whs}
            onChange={(e) => setForm({...form, whs: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            type="date"
            placeholder="IB DATE *"
            value={form.ibDate}
            onChange={(e) => setForm({...form, ibDate: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="STORE FROM *"
            value={form.storeFrom}
            onChange={(e) => setForm({...form, storeFrom: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="STORE"
            value={form.store}
            onChange={(e) => setForm({...form, store: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="INVOICE"
            value={form.invoice}
            onChange={(e) => setForm({...form, invoice: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="RACK ZONE"
            value={form.rackZone}
            onChange={(e) => setForm({...form, rackZone: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="SKU STICKER"
            value={form.skuSticker}
            onChange={(e) => setForm({...form, skuSticker: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="STATUS"
            value={form.status}
            onChange={(e) => setForm({...form, status: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="QTY STICKER"
            value={form.qtySticker}
            onChange={(e) => setForm({...form, qtySticker: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="QTY ACTUAL"
            value={form.qtyActual}
            onChange={(e) => setForm({...form, qtyActual: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="REMARKS"
            value={form.remarks}
            onChange={(e) => setForm({...form, remarks: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '30px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          SIMPAN ISSUE
        </button>
      </div>
    </div>
  )
}

// MODAL CASE (sederhana)
function CaseModal({ onClose, user }) {
  const [form, setForm] = useState({
    date: '',
    warehouse: '',
    storeFrom: '',
    store: '',
    invoice: '',
    category: '',
    detail: '',
    rackZone: '',
    line: '',
    qtyActual: ''
  })

  async function handleSubmit() {
    const { error } = await supabase
      .from('case_area')
      .insert([{
        ...form,
        timestamp: new Date().toISOString(),
        pic_name: user.nama,
        nik: user.nik,
        qty_actual: parseInt(form.qtyActual) || 0
      }])

    if (!error) {
      alert('Case saved!')
      onClose()
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        width: '95%',
        maxWidth: '800px',
        borderRadius: '30px',
        padding: '30px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '40px', margin: 0 }}>CASE IN AREA</h2>
          <button onClick={onClose} style={{ fontSize: '50px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          <input
            type="date"
            placeholder="DATE"
            value={form.date}
            onChange={(e) => setForm({...form, date: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="WAREHOUSE"
            value={form.warehouse}
            onChange={(e) => setForm({...form, warehouse: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="STORE FROM"
            value={form.storeFrom}
            onChange={(e) => setForm({...form, storeFrom: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="STORE"
            value={form.store}
            onChange={(e) => setForm({...form, store: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="INVOICE"
            value={form.invoice}
            onChange={(e) => setForm({...form, invoice: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="CATEGORY CASE"
            value={form.category}
            onChange={(e) => setForm({...form, category: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="DETAIL CASE"
            value={form.detail}
            onChange={(e) => setForm({...form, detail: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="RACK ZONE"
            value={form.rackZone}
            onChange={(e) => setForm({...form, rackZone: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            placeholder="LINE"
            value={form.line}
            onChange={(e) => setForm({...form, line: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="QTY ACTUAL"
            value={form.qtyActual}
            onChange={(e) => setForm({...form, qtyActual: e.target.value})}
            style={{ padding: '15px', fontSize: '24px', borderRadius: '10px', border: '2px solid #ddd' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '30px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          SIMPAN CASE
        </button>
      </div>
    </div>
  )
}