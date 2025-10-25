// deno-lint-ignore-file no-explicit-any
import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaSearch, FaDownload } from 'react-icons/fa';
import { api } from '../lib/apiClient.ts';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/colleges.css';
import Select from 'react-select';

interface Room {
  room_id: string;
  room_name: string;
  room_type: string;
  room_capacity: number;
  building_id: string;
  building_name?: string;
}

interface Building {
  building_id: string;
  building_name: string;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newRoom, setNewRoom] = useState<Room>({
    room_id: '',
    room_name: '',
    room_type: '',
    room_capacity: 0,
    building_id: '',
  });

  // ✅ Fetch all data once on mount
  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ Unified fetch for both rooms & buildings
  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [roomRes, buildingRes] = await Promise.all([
        api.get('/tbl_rooms'),
        api.get('/tbl_buildings'),
      ]);
      setRooms(roomRes.data ?? []);
      setBuildings(buildingRes.data ?? []);
    } catch (err: any) {
      console.error(err.message);
      toast.error('Failed to fetch rooms or buildings');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Create or update
  const handleSubmit = async () => {
    const { room_id, room_name, room_type, room_capacity, building_id } = newRoom;
    if (!room_id || !room_name || !room_type || !room_capacity || !building_id) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        room_name,
        room_type,
        room_capacity,
        building: building_id, // Django expects FK
      };

      if (editMode) {
        await api.put(`/tbl_rooms/${room_id}/`, payload);
        toast.success('Room updated successfully');
      } else {
        await api.post('/tbl_rooms', { room_id, ...payload });
        toast.success('Room added successfully');
      }

      setShowModal(false);
      setTimeout(() => fetchAll(), 300); // small delay for smoother refresh
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      toast.error('Failed to save room');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Delete
  const handleDelete = async (room_id: string) => {
    if (!globalThis.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/tbl_rooms/${room_id}/`);
      toast.success('Room deleted');
      setTimeout(() => fetchAll(), 300);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete room');
    }
  };

  // ✅ Import Excel
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let added = 0;
      for (const row of rows) {
        const room_id = row['Room ID']?.trim();
        const room_name = row['Room Name']?.trim();
        const room_type = row['Room Type']?.trim();
        const room_capacity = parseInt(row['Room Capacity'] || 0);
        const building_id = row['Building ID']?.trim();

        if (!room_id || !room_name || !room_type || !room_capacity || !building_id) continue;

        try {
          await api.post('/tbl_rooms', {
            room_id,
            room_name,
            room_type,
            room_capacity,
            building: building_id,
          });
          added++;
        } catch {
          continue;
        }
      }

      toast.success(`Import completed: ${added} room(s) added`);
      setShowImport(false);
      setTimeout(() => fetchAll(), 300);
    };

    reader.readAsArrayBuffer(file);
  };

  // ✅ Download Template
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Room ID', 'Room Name', 'Room Type', 'Room Capacity', 'Building ID'],
      ['9-301', 'Cisco Lab', 'Laboratory', 15, 'BLDG.09'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms Template');
    XLSX.writeFile(wb, 'rooms_template.xlsx');
  };

  const filtered = rooms.filter(
    (r) =>
      r.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="colleges-container">
      <div className="colleges-header">
        <h2 className="colleges-title">Manage Rooms</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Room Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" className="search-button">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="colleges-actions">
        <button
          type="button"
          className="action-button add-new"
          onClick={() => {
            setEditMode(false);
            setNewRoom({
              room_id: '',
              room_name: '',
              room_type: '',
              room_capacity: 0,
              building_id: '',
            });
            setShowModal(true);
          }}
        >
          Add New Room
        </button>

        <button type="button" className="action-button import" onClick={() => setShowImport(true)}>
          Import Rooms
        </button>

        <button type="button" className="action-button download" onClick={downloadTemplate}>
          <FaDownload style={{ marginRight: 5 }} /> Download Template
        </button>
      </div>

      <div className="colleges-table-container">
        <table className="colleges-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Room #</th>
              <th>Room Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Building</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="loading-placeholder">Loading data...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((r, i) => (
                <tr key={r.room_id}>
                  <td>{i + 1}</td>
                  <td>{r.room_id}</td>
                  <td>{r.room_name}</td>
                  <td>{r.room_type}</td>
                  <td>{r.room_capacity}</td>
                  <td>{r.building_name || r.building_id}</td>
                  <td className="action-buttons">
                    <button
                      type="button"
                      className="icon-button edit-button"
                      onClick={() => {
                        setEditMode(true);
                        setNewRoom({
                          room_id: r.room_id,
                          room_name: r.room_name,
                          room_type: r.room_type,
                          room_capacity: r.room_capacity,
                          building_id: r.building_id,
                        });
                        setShowModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      className="icon-button delete-button"
                      onClick={() => handleDelete(r.room_id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No rooms found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ textAlign: 'center' }}>{editMode ? 'Edit Room' : 'Add New Room'}</h3>
            <div className="input-group">
              <label>Room ID</label>
              <input
                type="text"
                value={newRoom.room_id}
                disabled={editMode}
                onChange={(e) => setNewRoom({ ...newRoom, room_id: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Room Name</label>
              <input
                type="text"
                value={newRoom.room_name}
                onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Room Type</label>
              <select
                value={newRoom.room_type}
                onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
              </select>
            </div>
            <div className="input-group">
              <label>Room Capacity</label>
              <input
                type="number"
                value={newRoom.room_capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, room_capacity: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="input-group">
              <label>Building</label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={buildings
                  .sort((a, b) => a.building_name.localeCompare(b.building_name))
                  .map((b) => ({
                    value: b.building_id,
                    label: `${b.building_name} (${b.building_id})`,
                  }))}
                value={buildings
                  .map((b) => ({
                    value: b.building_id,
                    label: `${b.building_name} (${b.building_id})`,
                  }))
                  .find((option) => option.value === newRoom.building_id)}
                onChange={(selected) =>
                  setNewRoom({ ...newRoom, building_id: selected?.value || '' })
                }
                placeholder="Select Building"
                isClearable
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Import Modal */}
      {showImport && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ textAlign: 'center' }}>Import Rooms</h3>
            <input type="file" accept=".xlsx,.xls" onChange={handleImportFile} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowImport(false)}>
                Done
              </button>
              <button type="button" onClick={() => setShowImport(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Rooms;
