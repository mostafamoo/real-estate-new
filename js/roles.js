/**
 * Roles Management Module
 * Handles role creation, editing, deletion, and permission management.
 */

class RolesManager {
    constructor() {
        this.roles = [
            {
                id: 'role_super_admin',
                name: 'Super Admin',
                type: 'SYSTEM',
                description: 'Full access to all system features and settings.',
                userCount: 2,
                permissions: ['all']
            },
            {
                id: 'role_admin',
                name: 'Admin',
                type: 'SYSTEM',
                description: 'Can manage users, leads, and deals but cannot change system settings.',
                userCount: 5,
                permissions: ['leads.view', 'leads.edit', 'deals.view', 'deals.edit', 'users.view']
            },
            {
                id: 'role_agent',
                name: 'Agent',
                type: 'SYSTEM',
                description: 'Can view and manage assigned leads and deals.',
                userCount: 12,
                permissions: ['leads.view_assigned', 'deals.view_assigned']
            },
            {
                id: 'role_custom_1',
                name: 'Sales Manager',
                type: 'CUSTOM',
                description: 'Oversees sales team and reports.',
                userCount: 3,
                permissions: ['leads.view', 'leads.edit', 'reports.view']
            }
        ];

        this.permissionModules = [
            {
                id: 'leads',
                name: 'Leads Management',
                actions: [
                    { id: 'leads.view', label: 'View Leads' },
                    { id: 'leads.create', label: 'Create Leads' },
                    { id: 'leads.edit', label: 'Edit Leads' },
                    { id: 'leads.delete', label: 'Delete Leads' }
                ]
            },
            {
                id: 'deals',
                name: 'Deals & Pipeline',
                actions: [
                    { id: 'deals.view', label: 'View Deals' },
                    { id: 'deals.create', label: 'Create Deals' },
                    { id: 'deals.edit', label: 'Edit Deals' },
                    { id: 'deals.move', label: 'Move Deal Stage' }
                ]
            },
            {
                id: 'users',
                name: 'User Management',
                actions: [
                    { id: 'users.view', label: 'View Users' },
                    { id: 'users.invite', label: 'Invite Users' },
                    { id: 'users.manage_roles', label: 'Manage Roles' }
                ]
            },
            {
                id: 'reports',
                name: 'Reports & Analytics',
                actions: [
                    { id: 'reports.view', label: 'View Reports' },
                    { id: 'reports.export', label: 'Export Data' }
                ]
            }
        ];

        this.currentMode = 'create'; // create, edit, view
        this.editingRoleId = null;

        // Bind methods
        this.init = this.init.bind(this);
        this.renderRoles = this.renderRoles.bind(this);
        this.openDrawer = this.openDrawer.bind(this);
        this.closeDrawer = this.closeDrawer.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.togglePermissionGroup = this.togglePermissionGroup.bind(this);
        this.toggleAllPermissions = this.toggleAllPermissions.bind(this);

        // Initialize on load
        document.addEventListener('DOMContentLoaded', this.init);
    }

    init() {
        this.renderRoles();
        this.renderPermissionForm();

        // Event Listeners
        document.getElementById('createRoleBtn').addEventListener('click', () => this.openDrawer('create'));
        document.getElementById('cancelRoleBtn').addEventListener('click', this.closeDrawer);
        document.getElementById('roleForm').addEventListener('submit', this.handleSave);
        document.querySelector('.drawer-backdrop').addEventListener('click', this.closeDrawer);

        // Select All checkboxes
        document.getElementById('selectAllGlobal').addEventListener('change', this.toggleAllPermissions);
    }

    renderRoles() {
        const tbody = document.getElementById('rolesTableBody');
        tbody.innerHTML = '';

        if (this.roles.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray">No roles found.</td></tr>`;
            return;
        }

        this.roles.forEach(role => {
            const tr = document.createElement('tr');

            const badgeClass = role.type === 'SYSTEM' ? 'badge-system' : 'badge-custom';
            const isSystem = role.type === 'SYSTEM';

            // Actions
            let actionsHtml = '';
            if (isSystem) {
                actionsHtml = `
                    <button class="btn-icon-sm" onclick="rolesManager.openDrawer('view', '${role.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-sm" disabled title="System roles cannot be edited">
                        <i class="fas fa-lock"></i>
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn-icon-sm" onclick="rolesManager.openDrawer('edit', '${role.id}')" title="Edit Role">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-sm delete" onclick="rolesManager.deleteRole('${role.id}')" title="Delete Role">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            }

            tr.innerHTML = `
                <td>
                    <div class="role-name">${role.name}</div>
                    ${role.userCount > 0 ? `<div class="text-xs text-gray mt-1">${role.userCount} users assigned</div>` : ''}
                </td>
                <td><span class="badge ${badgeClass}">${role.type}</span></td>
                <td><div class="role-desc" title="${role.description}">${role.description}</div></td>
                <td><div class="action-buttons">${actionsHtml}</div></td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderPermissionForm() {
        const container = document.getElementById('permissionsContainer');
        container.innerHTML = '';

        this.permissionModules.forEach(module => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'permission-group';

            const actionsHtml = module.actions.map(action => `
                <label class="form-checkbox">
                    <input type="checkbox" name="permissions" value="${action.id}" data-module="${module.id}">
                    <span>${action.label}</span>
                </label>
            `).join('');

            groupDiv.innerHTML = `
                <div class="permission-group-header">
                    <span class="permission-group-title">${module.name}</span>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="rolesManager.togglePermissionGroup('${module.id}', this)">Select All</button>
                </div>
                <div class="permission-options">
                    ${actionsHtml}
                </div>
            `;
            container.appendChild(groupDiv);
        });
    }

    openDrawer(mode, roleId = null) {
        this.currentMode = mode;
        this.editingRoleId = roleId;

        const drawerTitle = document.getElementById('drawerTitle');
        const roleNameInput = document.getElementById('roleName');
        const roleDescInput = document.getElementById('roleDesc');
        const saveBtn = document.getElementById('saveRoleBtn');
        const formFieldset = document.getElementById('formFieldset');

        // Reset form
        document.getElementById('roleForm').reset();
        roleNameInput.classList.remove('error');

        // Set state based on mode
        if (mode === 'create') {
            drawerTitle.textContent = 'Create New Role';
            saveBtn.textContent = 'Create Role';
            saveBtn.classList.remove('hidden');
            formFieldset.disabled = false;
        } else if (mode === 'edit' || mode === 'view') {
            const role = this.roles.find(r => r.id === roleId);
            if (!role) return;

            drawerTitle.textContent = mode === 'edit' ? 'Edit Role' : 'Role Details';
            roleNameInput.value = role.name;
            roleDescInput.value = role.description;

            // Set permissions
            if (role.permissions.includes('all')) {
                document.querySelectorAll('input[name="permissions"]').forEach(cb => cb.checked = true);
            } else {
                role.permissions.forEach(perm => {
                    const cb = document.querySelector(`input[value="${perm}"]`);
                    if (cb) cb.checked = true;
                });
            }

            if (mode === 'view') {
                saveBtn.classList.add('hidden');
                formFieldset.disabled = true;
            } else {
                saveBtn.textContent = 'Save Changes';
                saveBtn.classList.remove('hidden');
                formFieldset.disabled = false;
            }
        }

        document.getElementById('roleDrawer').classList.add('open');
        document.getElementById('drawerBackdrop').classList.add('open');
    }

    closeDrawer() {
        document.getElementById('roleDrawer').classList.remove('open');
        document.getElementById('drawerBackdrop').classList.remove('open');
    }

    handleSave(e) {
        e.preventDefault();

        const name = document.getElementById('roleName').value.trim();
        const description = document.getElementById('roleDesc').value.trim();

        // Validation
        if (!name) {
            this.showToast('Role name is required', 'error');
            return;
        }

        // Check unique name
        const existing = this.roles.find(r => r.name.toLowerCase() === name.toLowerCase() && r.id !== this.editingRoleId);
        if (existing) {
            this.showToast('Role name must be unique', 'error');
            return;
        }

        const selectedPermissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked')).map(cb => cb.value);

        if (this.currentMode === 'create') {
            const newRole = {
                id: `role_${Date.now()}`,
                name,
                type: 'CUSTOM',
                description,
                userCount: 0,
                permissions: selectedPermissions
            };
            this.roles.push(newRole);
            this.showToast('Role created successfully', 'success');
        } else if (this.currentMode === 'edit') {
            const roleIndex = this.roles.findIndex(r => r.id === this.editingRoleId);
            if (roleIndex !== -1) {
                this.roles[roleIndex] = {
                    ...this.roles[roleIndex],
                    name,
                    description,
                    permissions: selectedPermissions
                };
                this.showToast('Role updated successfully', 'success');
            }
        }

        this.renderRoles();
        this.closeDrawer();
    }

    deleteRole(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;

        if (role.userCount > 0) {
            this.showToast(`Cannot delete role used by ${role.userCount} users.`, 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            this.roles = this.roles.filter(r => r.id !== roleId);
            this.renderRoles();
            this.showToast('Role deleted successfully', 'success');
        }
    }

    togglePermissionGroup(moduleId, btn) {
        const checkboxes = document.querySelectorAll(`input[data-module="${moduleId}"]`);
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => cb.checked = !allChecked);
        // btn.textContent = allChecked ? 'Select All' : 'Deselect All';
    }

    toggleAllPermissions(e) {
        const checked = e.target.checked;
        document.querySelectorAll('input[name="permissions"]').forEach(cb => cb.checked = checked);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Instantiate and expose globally
const rolesManager = new RolesManager();
window.rolesManager = rolesManager;
