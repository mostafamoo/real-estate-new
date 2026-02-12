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
                id: 'corporate',
                name: 'Corporate Manager',
                actions: [
                    { id: 'corporate.settings', label: 'Manage corporate settings' },
                    { id: 'corporate.commission', label: 'Manage Corporate Commission' },
                    { id: 'corporate.roles', label: 'Manage Roles (create, list, edit, delete)' },
                    { id: 'corporate.users', label: 'Manage Users' },
                    { id: 'corporate.teams', label: 'Manage Teams' },
                    { id: 'corporate.offices', label: 'Manage Offices' }
                ]
            },
            {
                id: 'listing',
                name: 'Listing',
                actions: [
                    { id: 'listing.create', label: 'Create Manual Listing' },
                    { id: 'listing.list_assigned', label: 'List Assigned Listings' },
                    { id: 'listing.list_all', label: 'List All Listings' },
                    { id: 'listing.export', label: 'Export Listings (manual only)' },
                    { id: 'listing.edit', label: 'Edit my Listing' },
                    { id: 'listing.delete', label: 'Delete Listing' },
                    { id: 'listing.view_details', label: 'View Listing Details' },
                    { id: 'listing.assign', label: 'Assign Listing to Agent' },
                    { id: 'listing.create_mls', label: 'Create Listing by mls-id' },
                    { id: 'listing.add_prospect', label: 'Add Listing Prospect' },
                    { id: 'listing.add_activity', label: 'Add Activity on Listings' },
                    { id: 'listing.report_my', label: 'My Listings Reports' },
                    { id: 'listing.report_all', label: 'All Listings Reports' }
                ]
            },
            {
                id: 'lead',
                name: 'Lead',
                actions: [
                    { id: 'lead.create', label: 'Create Lead' },
                    { id: 'lead.list_assigned', label: 'List assigned Leads' },
                    { id: 'lead.list_all', label: 'List All Leads' },
                    { id: 'lead.edit', label: 'Edit Lead' },
                    { id: 'lead.view_profile', label: 'View lead profile' },
                    { id: 'lead.view_history', label: 'View lead log history' },
                    { id: 'lead.view_all_history', label: 'View All Lead Log history' },
                    { id: 'lead.assign', label: 'Assign lead to Agent' },
                    { id: 'lead.reassign', label: 'Reassign lead to Agent' },
                    { id: 'lead.assign_other', label: 'Assign Lead to Other Agent/s' },
                    { id: 'lead.reassign_other', label: 'Reassign Lead to other Agent/s' },
                    { id: 'lead.round_robin', label: 'Round-Robin' },
                    { id: 'lead.export', label: 'Export Leads "listed only"' },
                    { id: 'lead.import', label: 'Import Leads' },
                    { id: 'lead.add_note', label: 'Add Lead Note' },
                    { id: 'lead.follow_up', label: 'Lead Follow up Activity' },
                    { id: 'lead.stage_action', label: 'Lead Stages Action' },
                    { id: 'lead.bulk_stage', label: 'Bulk leads Stage action' },
                    { id: 'lead.bulk_assign', label: 'Bulk leads Assign action' },
                    { id: 'lead.bulk_move', label: 'Bulk leads Move action' },
                    { id: 'lead.bulk_note', label: 'Bulk leads Note action' },
                    { id: 'lead.notification', label: 'Lead notification' },
                    { id: 'lead.report_my', label: 'My Leads Reports' },
                    { id: 'lead.report_all', label: 'All leads Reports' },
                    { id: 'lead.settings', label: 'leads Settings' }
                ]
            },
            {
                id: 'buyer',
                name: 'Buyer',
                actions: [
                    { id: 'buyer.create', label: 'Create Buyer Profiles' },
                    { id: 'buyer.list_assigned', label: 'List assigned Buyer Profiles' },
                    { id: 'buyer.list_all', label: 'List All Buyer Profiles' },
                    { id: 'buyer.edit', label: 'Edit Buyer Profiles' },
                    { id: 'buyer.delete', label: 'Delete Buyer Profile' },
                    { id: 'buyer.view_details', label: 'View Buyer profiles details' },
                    { id: 'buyer.view_history', label: 'View Buyer Profiles log history' },
                    { id: 'buyer.assign', label: 'Assign Buyer Profile to Agent' },
                    { id: 'buyer.reassign', label: 'Reassign Buyer Profile to Agent' },
                    { id: 'buyer.assign_other', label: 'Assign Buyer Profile to Other Agent/s' },
                    { id: 'buyer.reassign_other', label: 'Reassign Buyer Profile to other Agent/s' },
                    { id: 'buyer.export', label: 'Export Buyer Profiles "listed only"' },
                    { id: 'buyer.follow_up', label: 'Buyer Profile Follow up Activity' },
                    { id: 'buyer.stage_action', label: 'Buyer Profile Stages Action' },
                    { id: 'buyer.report_assigned', label: 'Assigned Buyer Profile Reports' },
                    { id: 'buyer.report_all', label: 'All Buyer Profile Reports' }
                ]
            },
            {
                id: 'deal',
                name: 'Deal',
                actions: [
                    { id: 'deal.list_assigned', label: 'List agent deals' },
                    { id: 'deal.list_all', label: 'List All Deal' },
                    { id: 'deal.create', label: 'Create Deal' },
                    { id: 'deal.edit', label: 'Edit Deal' },
                    { id: 'deal.change_stage', label: 'Change Deal Stage' },
                    { id: 'deal.add_activity', label: 'Add Deal Activity' },
                    { id: 'deal.settings', label: 'Deals Settings' },
                    { id: 'deal.report_my', label: 'My Deals Report' },
                    { id: 'deal.report_all', label: 'All Deals Reports' }
                ]
            },
            {
                id: 'transaction',
                name: 'Transaction Commission',
                actions: [
                    { id: 'transaction.list_my', label: 'List my Transactions' },
                    { id: 'transaction.list_all', label: 'List All Transactions' },
                    { id: 'transaction.create', label: 'Create Transaction' },
                    { id: 'transaction.change_status', label: 'Change Transction Status' },
                    { id: 'transaction.settings', label: 'Transctions Settings' },
                    { id: 'transaction.report_my', label: 'My Transactions Reports' },
                    { id: 'transaction.report_all', label: 'All transactoins Reports' }
                ]
            },
            {
                id: 'external_agent',
                name: 'External Agent',
                actions: [
                    { id: 'external_agent.list', label: 'List External Agents' },
                    { id: 'external_agent.create', label: 'Create External Agent' },
                    { id: 'external_agent.edit', label: 'Edit External Agents' },
                    { id: 'external_agent.delete', label: 'Delete External Agents' },
                    { id: 'external_agent.export', label: 'Export External Agents' },
                    { id: 'external_agent.add_activity', label: 'Add Activity on External Agent' }
                ]
            },
            {
                id: 'mls',
                name: 'MLS (filter & IDX)',
                actions: [
                    { id: 'mls.search', label: 'Access MLS Search' },
                    { id: 'mls.filters', label: 'Use Advanced Filters' },
                    { id: 'mls.view_details', label: 'View MLS Property Details' },
                    { id: 'mls.save_search', label: 'Save MLS Searches' },
                    { id: 'mls.add_favorite', label: 'Add Property to Favorites' },
                    { id: 'mls.remove_favorite', label: 'Remove Property from Favorites' },
                    { id: 'mls.match_lead', label: 'Match Property with Lead' },
                    { id: 'mls.match_buyer', label: 'Match Property with Buyer' },
                    { id: 'mls.view_matched', label: 'View Matched Properties' },
                    { id: 'mls.create_lead', label: 'Create Lead from MLS Property' },
                    { id: 'mls.create_buyer', label: 'Create Buyer from MLS Property' },
                    { id: 'mls.idx_settings', label: 'Access IDX Settings' },
                    { id: 'mls.idx_manage', label: 'Manage IDX Integration' },
                    { id: 'mls.trigger_sync', label: 'Trigger MLS Sync' },
                    { id: 'mls.view_logs', label: 'View MLS Sync Logs' },
                    { id: 'mls.report_properties', label: 'MLS Properties Reports' },
                    { id: 'mls.report_matching', label: 'MLS Matching Reports' }
                ]
            },
            {
                id: 'campaign_ads',
                name: 'Campaigns Social Ads',
                actions: [
                    { id: 'campaign_ads.create', label: 'Create Marketing Campaign' },
                    { id: 'campaign_ads.edit', label: 'Edit Marketing Campaign' },
                    { id: 'campaign_ads.delete', label: 'Delete Marketing Campaign' },
                    { id: 'campaign_ads.view', label: 'View Marketing Campaigns' },
                    { id: 'campaign_ads.launch', label: 'Launch / Stop Campaign' },
                    { id: 'campaign_ads.create_template', label: 'Create Marketing Templates' },
                    { id: 'campaign_ads.edit_template', label: 'Edit Marketing Templates' },
                    { id: 'campaign_ads.delete_template', label: 'Delete Marketing Templates' },
                    { id: 'campaign_ads.channel_email', label: 'Use Email Channel' },
                    { id: 'campaign_ads.channel_sms', label: 'Use SMS Channel' },
                    { id: 'campaign_ads.channel_whatsapp', label: 'Use WhatsApp Channel' },
                    { id: 'campaign_ads.create_workflow', label: 'Create Automation Workflow' },
                    { id: 'campaign_ads.edit_workflow', label: 'Edit Automation Workflow' },
                    { id: 'campaign_ads.activate_automation', label: 'Activate / Deactivate Automation' },
                    { id: 'campaign_ads.target_audience', label: 'Select Target Audience' },
                    { id: 'campaign_ads.send_message', label: 'Send Marketing Messages' },
                    { id: 'campaign_ads.view_analytics', label: 'View Marketing Analytics' },
                    { id: 'campaign_ads.view_reports', label: 'View Campaign Performance Reports' },
                    { id: 'campaign_ads.settings', label: 'Access Marketing Settings' }
                ]
            },
            {
                id: 'campaign_messages',
                name: 'Campaigns Messages',
                actions: [
                    { id: 'campaign_messages.list_drip', label: 'List Drip-Campaigns' },
                    { id: 'campaign_messages.list_drip_all', label: 'List All Drip-Campaigns' },
                    { id: 'campaign_messages.manage_drip', label: 'Manage Drip Campaigns' },
                    { id: 'campaign_messages.enroll_lead', label: 'Add Enroll leads in Drip Campaigns' },
                    { id: 'campaign_messages.edit_drip', label: 'Edit Drip Campaigns Templates' },
                    { id: 'campaign_messages.list_auto', label: 'List Auto messages' },
                    { id: 'campaign_messages.list_auto_all', label: 'List All Auto Messages' },
                    { id: 'campaign_messages.toggle_auto', label: 'Active/in-Active Auto Messages' },
                    { id: 'campaign_messages.edit_auto', label: 'Edit auto messages Templates' },
                    { id: 'campaign_messages.list_bulk', label: 'List my Bulk Messages' },
                    { id: 'campaign_messages.list_bulk_all', label: 'List All Bulk Messages' },
                    { id: 'campaign_messages.create_bulk', label: 'Create Bulk messages' }
                ]
            },
            {
                id: 'microsite',
                name: 'Microsite',
                actions: [
                    { id: 'microsite.access', label: 'Access Agent Website' },
                    { id: 'microsite.edit_content', label: 'Edit Website Content' },
                    { id: 'microsite.manage_pages', label: 'Manage Website Pages' },
                    { id: 'microsite.publish', label: 'Publish / Unpublish Website' },
                    { id: 'microsite.manage_listings', label: 'Manage Website Listings' },
                    { id: 'microsite.enable_forms', label: 'Enable Lead Capture Forms' },
                    { id: 'microsite.view_leads', label: 'View Website Leads' },
                    { id: 'microsite.manage_branding', label: 'Manage Branding (Logo / Colors)' },
                    { id: 'microsite.manage_seo', label: 'Manage SEO Settings' },
                    { id: 'microsite.view_analytics', label: 'View Website Analytics' }
                ]
            },
            {
                id: 'calendar',
                name: 'Calendar & Tasks',
                actions: [
                    { id: 'calendar.view', label: 'View Calendar' },
                    { id: 'calendar.sync', label: 'Sync google Calendar' },
                    { id: 'calendar.create_task', label: 'Create Task' },
                    { id: 'calendar.edit_task', label: 'Edit Task' },
                    { id: 'calendar.delete_task', label: 'Delete Task' },
                    { id: 'calendar.view_assigned_tasks', label: 'View Assigned Tasks' },
                    { id: 'calendar.view_all_tasks', label: 'View All Tasks' },
                    { id: 'calendar.assign_task', label: 'Assign Task to User' },
                    { id: 'calendar.reassign_task', label: 'Reassign Task' },
                    { id: 'calendar.change_status', label: 'Change Task Status' },
                    { id: 'calendar.reminder', label: 'Set Task Reminder' },
                    { id: 'calendar.create_event', label: 'Create Calendar Event' },
                    { id: 'calendar.edit_event', label: 'Edit Calendar Event' },
                    { id: 'calendar.delete_event', label: 'Delete Calendar Event' },
                    { id: 'calendar.create_training', label: 'Create Training' },
                    { id: 'calendar.edit_training', label: 'Edit Training' },
                    { id: 'calendar.delete_training', label: 'Delete Training' },
                    { id: 'calendar.view_assigned_training', label: 'View Assigned Training' },
                    { id: 'calendar.view_all_training', label: 'View All Training' }
                ]
            },
            {
                id: 'subscription',
                name: 'Subscription Invoices',
                actions: [
                    { id: 'subscription.view_plan', label: 'View Subscription Plan' },
                    { id: 'subscription.upgrade', label: 'Upgrade / Downgrade Plan' },
                    { id: 'subscription.cancel', label: 'Cancel Subscription' },
                    { id: 'subscription.view_invoices', label: 'View Invoices' },
                    { id: 'subscription.download_invoices', label: 'Download Invoices' },
                    { id: 'subscription.view_history', label: 'View Payment History' },
                    { id: 'subscription.manage_method', label: 'Manage Payment Method' },
                    { id: 'subscription.view_limits', label: 'View Usage Limits' },
                    { id: 'subscription.settings', label: 'Access Billing Settings' }
                ]
            },
            {
                id: 'reports',
                name: 'Reports',
                actions: [
                    { id: 'reports.access', label: 'Access Reports Dashboard' },
                    { id: 'reports.view_leads', label: 'View Leads Reports' },
                    { id: 'reports.view_buyers', label: 'View Buyers Reports' },
                    { id: 'reports.view_listings', label: 'View Listings Reports' },
                    { id: 'reports.view_agent_perf', label: 'View Agent Performance Reports' },
                    { id: 'reports.view_company_perf', label: 'View Company Performance Reports' },
                    { id: 'reports.filters', label: 'Apply Advanced Report Filters' },
                    { id: 'reports.export', label: 'Export Reports' },
                    { id: 'reports.schedule', label: 'Schedule Reports' },
                    { id: 'reports.share', label: 'Share Reports with Users' }
                ]
            }
        ];

        this.currentMode = 'create'; // create, edit, view
        this.editingRoleId = null;
        this.activeTab = 'section-general';

        // Bind methods
        this.init = this.init.bind(this);
        this.renderRoles = this.renderRoles.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.switchTab = this.switchTab.bind(this);
        this.togglePermissionGroup = this.togglePermissionGroup.bind(this);
    }

    init() {
        console.log('RolesManager: init called');
        this.renderRoles();
        this.renderPermissionNavigation();
        this.renderPermissionContent();

        // Event Listeners
        const createBtn = document.getElementById('createRoleBtn');
        if (createBtn) {
            console.log('RolesManager: Found createRoleBtn');
            createBtn.addEventListener('click', () => {
                console.log('RolesManager: Create button clicked');
                this.openModal('create');
            });
        } else {
            console.error('RolesManager: Create button NOT found');
        }

        // document.getElementById('cancelRoleBtn').addEventListener('click', this.closeModal); // Removed close button in header

        const form = document.getElementById('roleForm');
        if (form) {
            form.addEventListener('submit', this.handleSave);
        }

        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', this.closeModal);
        }

        // Tab Navigation
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('sidebar-link')) {
                e.preventDefault();
                this.switchTab(e.target.dataset.target);
            }
        });
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
                    <button class="btn-icon-sm" onclick="rolesManager.openModal('view', '${role.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-sm" disabled title="System roles cannot be edited">
                        <i class="fas fa-lock"></i>
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn-icon-sm" onclick="rolesManager.openModal('edit', '${role.id}')" title="Edit Role">
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

    renderPermissionNavigation() {
        const navContainer = document.getElementById('permissionNavLinks');
        navContainer.innerHTML = '';

        this.permissionModules.forEach(module => {
            const link = document.createElement('a');
            link.href = `#section-${module.id}`;
            link.className = 'sidebar-link';
            link.dataset.target = `section-${module.id}`;
            link.textContent = module.name;
            navContainer.appendChild(link);
        });
    }

    renderPermissionContent() {
        const contentContainer = document.getElementById('permissionsContainer');
        contentContainer.innerHTML = '';

        this.permissionModules.forEach(module => {
            const section = document.createElement('div');
            section.id = `section-${module.id}`;
            section.className = 'content-section';

            const actionsHtml = module.actions.map(action => `
                <label class="permission-item form-checkbox">
                    <input type="checkbox" name="permissions" value="${action.id}" data-module="${module.id}">
                    <span>${action.label}</span>
                </label>
            `).join('');

            section.innerHTML = `
                <div class="section-title">
                    <span>${module.name}</span>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="rolesManager.togglePermissionGroup('${module.id}', this)">Select All</button>
                </div>
                <div class="permission-grid">
                    ${actionsHtml}
                </div>
            `;
            contentContainer.appendChild(section);
        });
    }

    switchTab(targetId) {
        // Update active link
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            }
        });

        // Show active section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });

        // Scroll to top of content area
        const contentArea = document.querySelector('.role-modal-content');
        if (contentArea) contentArea.scrollTop = 0;

        this.activeTab = targetId;
    }

    openModal(mode, roleId = null) {
        console.log('RolesManager: openModal called', mode, roleId);
        this.currentMode = mode;
        this.editingRoleId = roleId;
        this.switchTab('section-general'); // Reset to general tab

        const modalTitle = document.getElementById('modalTitle');
        const roleNameInput = document.getElementById('roleName');
        const roleDescInput = document.getElementById('roleDesc');
        const saveBtn = document.getElementById('saveRoleBtn');

        // Reset form
        document.getElementById('roleForm').reset();

        // Set state based on mode
        if (mode === 'create') {
            modalTitle.textContent = 'Create New Role';
            saveBtn.textContent = 'Create Role';
            saveBtn.classList.remove('hidden');
        } else if (mode === 'edit' || mode === 'view') {
            const role = this.roles.find(r => r.id === roleId);
            if (!role) return;

            modalTitle.textContent = mode === 'edit' ? 'Edit Role' : 'Role Details';
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
            } else {
                saveBtn.textContent = 'Save Changes';
                saveBtn.classList.remove('hidden');
            }
        }

        document.getElementById('roleModal').classList.add('open');
        document.getElementById('modalBackdrop').classList.add('open');
    }

    closeModal() {
        document.getElementById('roleModal').classList.remove('open');
        document.getElementById('modalBackdrop').classList.remove('open');
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
        this.closeModal();
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
        if (btn) btn.textContent = !allChecked ? 'Deselect All' : 'Select All';
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

// Robust Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('RolesManager: DOMContentLoaded');
        rolesManager.init();
    });
} else {
    console.log('RolesManager: Immediate Init');
    rolesManager.init();
}
