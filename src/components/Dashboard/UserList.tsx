'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types'; 
import { 
  PencilSquareIcon, 
  TrashIcon, 
  UserCircleIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface UserListProps {
  users: User[];
}

export default function UserList({ users: initialUsers }: UserListProps) {
  const router = useRouter();
  
  // --- STATES ---
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Role Change States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [pendingRoleUpdate, setPendingRoleUpdate] = useState<{ userId: number, newRoleId: number, currentRoleId: number } | null>(null);

  // 2. Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: number, firstName: string, lastName: string, email: string } | null>(null);

  // 3. Delete States (NEW)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // --- HELPERS ---
  const getRoleName = (id: number) => {
    switch(id) {
      case 1: return 'Administrator';
      case 2: return 'Editor';
      case 3: return 'Viewer';
      default: return 'User';
    }
  };

  const getRoleBadgeStyle = (id: number) => {
    switch(id) {
      case 1: return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20'; 
      case 2: return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';       
      case 3: return 'bg-green-50 text-green-700 ring-1 ring-green-600/20';     
      default: return 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10';
    }
  };

  // --- ROLE HANDLERS ---
  const handleRoleSelect = (userId: number, newRoleString: string, currentRoleId: number) => {
    const newRoleId = parseInt(newRoleString);
    if (newRoleId === currentRoleId) return;
    setPendingRoleUpdate({ userId, newRoleId, currentRoleId });
    setIsRoleModalOpen(true);
  };

  const confirmRoleUpdate = async () => {
    if (!pendingRoleUpdate) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/update-role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingRoleUpdate.userId, roleId: pendingRoleUpdate.newRoleId })
      });
      if (!res.ok) throw new Error('Failed to update');

      const updatedUsers = users.map(u => 
        u.id === pendingRoleUpdate.userId ? { ...u, roleId: pendingRoleUpdate.newRoleId } : u
      );
      setUsers(updatedUsers);
      setIsRoleModalOpen(false);
      setPendingRoleUpdate(null);
      router.refresh(); 
    } catch (error) {
      console.error(error);
      alert('Failed to update role.');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- EDIT PROFILE HANDLERS ---
  const handleEditClick = (user: User) => {
    setEditingUser({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    }
  };

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false); 
    setIsSaveConfirmOpen(true);
  };

  const executeProfileUpdate = async () => {
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email
        })
      });
      if (!res.ok) throw new Error('Failed to update profile');

      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? { 
          ...u, 
          firstName: editingUser.firstName, 
          lastName: editingUser.lastName, 
          email: editingUser.email 
        } : u
      );
      setUsers(updatedUsers);
      setIsSaveConfirmOpen(false);
      setEditingUser(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to update profile.');
      setIsSaveConfirmOpen(false);
      setIsEditModalOpen(true); 
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const cancelSaveConfirm = () => {
    setIsSaveConfirmOpen(false);
    setIsEditModalOpen(true);
  };

  // --- DELETE HANDLERS (NEW) ---
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsUpdating(true);

    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id })
      });

      if (!res.ok) throw new Error('Failed to delete user');

      // Remove user from local list instantly
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      router.refresh();

    } catch (error) {
      console.error(error);
      alert('Failed to delete user.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
              
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                    User Management
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Manage user access and permissions.</p>
                </div>
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {users.length} Users
                </span>
              </div>

              {/* Table */}
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 sm:pl-6">User Profile</th>
                    <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Role</th>
                    <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center text-xs font-bold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getRoleBadgeStyle(user.roleId || 0)}`}>
                          {getRoleName(user.roleId || 0)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-700 font-medium">Active</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-center items-center gap-3">
                          <div className="relative">
                            <select
                              value={user.roleId} 
                              onChange={(e) => handleRoleSelect(user.id, e.target.value, user.roleId || 0)}
                              className="block w-32 appearance-none rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-xs sm:leading-6 cursor-pointer hover:bg-gray-50"
                            >
                              <option value="1">Administrator</option>
                              <option value="2">Editor</option>
                              <option value="3">Viewer</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* EDIT BUTTON */}
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          {/* DELETE BUTTON (UPDATED) */}
                          <button 
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: CONFIRM ROLE CHANGE --- */}
      {isRoleModalOpen && pendingRoleUpdate && (
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">Confirm Role Change</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Change role from <span className="font-bold">{getRoleName(pendingRoleUpdate.currentRoleId)}</span> to <span className="font-bold text-indigo-600">{getRoleName(pendingRoleUpdate.newRoleId)}</span>?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" disabled={isUpdating} onClick={confirmRoleUpdate} className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50">Confirm</button>
                  <button type="button" onClick={() => setIsRoleModalOpen(false)} disabled={isUpdating} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT USER FORM --- */}
      {isEditModalOpen && editingUser && (
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <form onSubmit={handlePreSave}>
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                        <PencilSquareIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">Edit User Profile</h3>
                        <div className="space-y-4 text-left mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstName" required value={editingUser.firstName} onChange={handleEditChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastName" required value={editingUser.lastName} onChange={handleEditChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" required value={editingUser.email} onChange={handleEditChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">Save Changes</button>
                    <button type="button" onClick={cancelEdit} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CONFIRM SAVE --- */}
      {isSaveConfirmOpen && editingUser && (
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">Confirm Profile Update</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Update profile for <span className="font-bold text-gray-900">{editingUser.firstName} {editingUser.lastName}</span>?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" disabled={isUpdating} onClick={executeProfileUpdate} className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50">
                    {isUpdating ? 'Saving...' : 'Confirm & Save'}
                  </button>
                  <button type="button" onClick={cancelSaveConfirm} disabled={isUpdating} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Go Back</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: DELETE CONFIRMATION (NEW) --- */}
      {isDeleteModalOpen && userToDelete && (
        <div className="relative z-50" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border-2 border-red-100">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">Delete User Account</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete <span className="font-bold text-gray-900">{userToDelete.firstName} {userToDelete.lastName}</span>?
                        </p>
                        <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100 font-medium">
                          ⚠️ This action is permanent and cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button 
                    type="button" 
                    disabled={isUpdating} 
                    onClick={confirmDelete} 
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {isUpdating ? 'Deleting...' : 'Delete Account'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    disabled={isUpdating} 
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}