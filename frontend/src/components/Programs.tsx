// deno-lint-ignore-file no-explicit-any
import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaSearch, FaDownload } from 'react-icons/fa';
import { api } from '../lib/apiClient.ts';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/programs.css';
import Select from 'react-select';

interface Department {
  department_id: string;
  department_name: string;
}

interface Program {
  program_id: string;
  program_name: string;
  department_id: string;
  department?: string | Department | null;
}

interface User {
  user_id: string;
}

interface ProgramsProps {
  user: User;
}

const Programs: React.FC<ProgramsProps> = ({ user: _user }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newProgId, setNewProgId] = useState('');
  const [newProgName, setNewProgName] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingProgId, setEditingProgId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDeptLabel, setNewDeptLabel] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs/');
      const normalized = response.data.map((p: any) => ({
        ...p,
        department_id:
          typeof p.department === 'object' && p.department
            ? p.department.department_id
            : p.department_id,
      }));
      setPrograms(normalized);
    } catch (err: any) {
      console.error('Failed to fetch programs:', err.message);
      toast.error('Failed to fetch programs.');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data);
    } catch (err: any) {
      console.error('Failed to fetch departments:', err.message);
      toast.error('Failed to fetch departments.');
    }
  };

  const getDepartmentName = (prog: Program): string => {
    if (typeof prog.department === 'object' && prog.department)
      return prog.department.department_name;
    if (typeof prog.department === 'string') {
      const match = prog.department.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const dept = departments.find((d) => d.department_id === match[1]);
        return dept ? dept.department_name : match[1];
      }
      return prog.department;
    }
    const deptObj = departments.find((d) => d.department_id === prog.department_id);
    return deptObj ? deptObj.department_name : 'N/A';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const filteredPrograms = programs.filter((p) => {
    const deptName = getDepartmentName(p).toLowerCase();
    return (
      p.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.program_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptName.includes(searchTerm.toLowerCase())
    );
  });

  const handleAddProgram = () => {
    setNewProgId('');
    setNewProgName('');
    setNewDeptId('');
    setEditMode(false);
    setEditingProgId(null);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!newProgId.trim() || !newProgName.trim() || !newDeptId) {
      toast.error('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editMode && editingProgId) {
        await api.patch(`/programs/${editingProgId}/`, {
          program_name: newProgName,
          department_id: newDeptId,
        });
        toast.success('Program updated.');
      } else {
        await api.post('/programs/', {
          program_id: newProgId,
          program_name: newProgName,
          department_id: newDeptId,
        });
        toast.success('Program added.');
      }
      await fetchPrograms();
      setShowModal(false);
    } catch (err: any) {
      console.error('Failed to save program:', err);
      toast.error('Failed to save program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/programs/${id}/`);
      setPrograms((prev) => prev.filter((p) => p.program_id !== id));
      toast.success('Program deleted.');
    } catch (err) {
      console.error('Failed to delete program:', err);
      toast.error('Failed to delete program.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      let successCount = 0;
      let failureCount = 0;

      for (const row of rows) {
        const progId = row['Program ID']?.trim();
        const progName = row['Program Name']?.trim();
        const deptName = row['Department Name']?.trim();

        const match = departments.find(
          (d) => d.department_name.trim().toLowerCase() === deptName?.trim().toLowerCase()
        );

        if (!progId || !progName || !match) {
          toast.warn(`Skipped: Invalid data for "${progName || progId || 'Unnamed'}"`);
          failureCount++;
          continue;
        }

        try {
          await api.post('/programs/', {
            program_id: progId,
            program_name: progName,
            department_id: match.department_id,
          });
          successCount++;
        } catch {
          failureCount++;
        }
      }

      toast.success(`Import completed: ${successCount} added, ${failureCount} failed.`);
      await fetchPrograms();
      setShowImport(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Program ID', 'Program Name', 'Department Name'],
      ['BSIT', 'Bachelor of Science in Information Technology', 'Department of IT'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Programs Template');
    XLSX.writeFile(wb, 'programs_template.xlsx');
  };

  return (
    <div className="colleges-container">
      <div className="colleges-header">
        <h2 className="colleges-title">Manage Programs</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for Programs"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="button" className="search-button">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="colleges-actions">
        <button type="button" onClick={handleAddProgram} className="action-button add-new">
          Add Program
        </button>
        <button type="button" onClick={() => setShowImport(true)} className="action-button import">
          Import Programs
        </button>
        <button type="button" onClick={downloadTemplate} className="action-button download">
          <FaDownload style={{ marginRight: 5 }} /> Download Template
        </button>
      </div>

      <div className="colleges-table-container">
        <table className="colleges-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length === 0 ? (
              <tr>
                <td colSpan={5}>No programs found.</td>
              </tr>
            ) : (
              filteredPrograms.map((p, idx) => (
                <tr key={p.program_id}>
                  <td>{idx + 1}</td>
                  <td>{p.program_id}</td>
                  <td>{p.program_name}</td>
                  <td>{getDepartmentName(p)}</td>
                  <td className="action-buttons">
                    <button
                      type="button"
                      onClick={() => {
                        setNewProgId(p.program_id);
                        setNewProgName(p.program_name);
                        setNewDeptId(p.department_id);
                        setEditMode(true);
                        setEditingProgId(p.program_id);
                        setShowModal(true);
                      }}
                      className="icon-button edit-button"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.program_id)}
                      className="icon-button delete-button"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ textAlign: 'center' }}>{editMode ? 'Edit Program' : 'Add Program'}</h3>
            <div className="input-group">
              <label>Program Code</label>
              <input
                type="text"
                value={newProgId}
                onChange={(e) => setNewProgId(e.target.value)}
                disabled={editMode}
              />
            </div>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={newProgName}
                onChange={(e) => setNewProgName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Department</label>
              <Select
                className="custom-select"
                classNamePrefix="custom"
                options={departments.map((d) => ({
                  value: d.department_id,
                  label: `${d.department_name} (${d.department_id})`,
                }))}
                value={
                  newDeptId
                    ? {
                        value: newDeptId,
                        // Find the department to construct the label, falling back to just the ID if not found
                        label:
                          departments.find((d) => d.department_id === newDeptId)?.department_name +
                          ` (${newDeptId})`,
                      }
                    : null
                }
                onChange={(selected) => setNewDeptId(selected ? selected.value : '')}
                placeholder="Select department"
                isClearable
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={handleModalSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ textAlign: 'center' }}>Import Programs</h3>
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

export default Programs;
