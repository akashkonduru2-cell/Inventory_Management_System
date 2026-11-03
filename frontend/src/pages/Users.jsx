import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge, StatusBadge } from '../components/Badge';
import { UserFormModal } from '../components/UserFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Alert } from '../components/Alert';
import { formatDateOnly } from '../utils/helpers';
import api from '../services/api';
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Search
} from 'lucide-react';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [formModal, setFormModal] = useState({ isOpen: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userToToggle) => {
    try {
      const newStatus = userToToggle.is_active ? 0 : 1;
      const res = await api.patch(`/users/${userToToggle.id}/status`, { is_active: newStatus });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `User ${userToToggle.name} ${newStatus ? 'activated' : 'deactivated'} successfully`
        });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to change user status.'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.user) return;
    try {
      const res = await api.delete(`/users/${deleteDialog.user.id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'User deleted successfully' });
        setDeleteDialog({ isOpen: false, user: null });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete user.'
      });
      setDeleteDialog({ isOpen: false, user: null });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>System User Management</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Admin-only console for provisioning accounts, assigning RBAC privileges, and account security
          </p>
        </div>
        <button
          onClick={() => setFormModal({ isOpen: true, user: null })}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Add System User</span>
        </button>
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="form-input search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <UsersIcon size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ fontWeight: 600, fontSize: '15px' }}>No users match the search filter</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Registration Date</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {u.name} {isSelf && <span style={{ fontSize: '11px', color: '#2563eb' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      <StatusBadge isActive={u.is_active} />
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {formatDateOnly(u.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`}
                          title={u.is_active ? 'Deactivate user' : 'Activate user'}
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                          <span>{u.is_active ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit User Profile"
                          onClick={() => setFormModal({ isOpen: true, user: u })}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          className="btn btn-outline btn-icon"
                          style={{ color: '#ef4444' }}
                          title="Delete User"
                          onClick={() => setDeleteDialog({ isOpen: true, user: u })}
                          disabled={isSelf}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* User Form Modal */}
      {formModal.isOpen && (
        <UserFormModal
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, user: null })}
          user={formModal.user}
          onSuccess={(msg) => {
            setFeedback({ type: 'success', message: msg });
            fetchUsers();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDialog.isOpen && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, user: null })}
          onConfirm={handleDeleteConfirm}
          title={`Delete User Account: ${deleteDialog.user?.name}`}
          message={`Are you sure you want to permanently delete the account for "${deleteDialog.user?.name}" (${deleteDialog.user?.email})?`}
        />
      )}
    </div>
  );
};
