/* ==========================================================================
   家庭文件小管家 (Family Document Butler) - Main Application Logic
   ========================================================================== */

(function () {
  'use strict';

  // Key LocalStorage Keys
  const STORAGE_DOCS_KEY = 'fdb_documents_v1';
  const STORAGE_CATS_KEY = 'fdb_categories_v1';
  const STORAGE_MEMBERS_KEY = 'fdb_members_v1';

  // Default Custom Calendar Events Data (Starts Clean with 0 Demo Items)
  const defaultCustomEvents = [];

  // Default Categories Data (Extensible & Renamable)
  const defaultCategories = [
    { id: 'cat-id', name: '身份證件', icon: 'fa-id-card', color: '#6366f1' },
    { id: 'cat-property', name: '房屋與車輛', icon: 'fa-house-lock', color: '#10b981' },
    { id: 'cat-medical', name: '醫療與保險', icon: 'fa-heart-pulse', color: '#ef4444' },
    { id: 'cat-finance', name: '財務與合約', icon: 'fa-file-invoice-dollar', color: '#f59e0b' },
    { id: 'cat-edu', name: '教育與認證', icon: 'fa-graduation-cap', color: '#8b5cf6' },
    { id: 'cat-life', name: '實體保固與收據', icon: 'fa-receipt', color: '#06b6d4' }
  ];

  // Default Family Members Data (Extensible & Renamable)
  const defaultMembers = [
    { id: 'mem-all', name: '全家共有', avatar: '🏠' },
    { id: 'mem-dad', name: '爸爸', avatar: '👨' },
    { id: 'mem-mom', name: '媽媽', avatar: '👩' },
    { id: 'mem-child', name: '孩子', avatar: '👦' }
  ];

  // Mock Document Data (Starts 100% Clean with 0 Demo Items)
  const defaultDocuments = [];

  // App State
  const STORAGE_EVENTS_KEY = 'fdb_custom_events_v1';

  let categories = loadState(STORAGE_CATS_KEY, defaultCategories);
  let members = loadState(STORAGE_MEMBERS_KEY, defaultMembers);
  let documents = loadState(STORAGE_DOCS_KEY, defaultDocuments);
  let customEvents = loadState(STORAGE_EVENTS_KEY, defaultCustomEvents);
  let currentLoggedInMemberId = loadState('fdb_current_member_id_v1', 'mem-dad');

  let currentCategoryFilter = 'all'; // 'all' or categoryId
  let currentMemberFilter = 'all';   // 'all' or memberId
  let currentStatusFilter = 'all';   // 'all', 'alert', 'recent'
  let searchQuery = '';
  let viewMode = 'grid'; // 'grid' or 'list'
  let selectedFileObj = null;

  // Cache DOM Elements
  const el = {
    documentsContainer: document.getElementById('documentsContainer'),
    emptyState: document.getElementById('emptyState'),
    sidebarCategories: document.getElementById('sidebarCategories'),
    sidebarMembers: document.getElementById('sidebarMembers'),
    categoryPills: document.getElementById('categoryPills'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    sortSelect: document.getElementById('sortSelect'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    currentFilterTitle: document.getElementById('currentFilterTitle'),
    
    // Stats
    statTotal: document.getElementById('statTotal'),
    statExpired: document.getElementById('statExpired'),
    statExpiring: document.getElementById('statExpiring'),
    statCategories: document.getElementById('statCategories'),
    badgeTotalDocs: document.getElementById('badgeTotalDocs'),
    badgeAlertDocs: document.getElementById('badgeAlertDocs'),

    // Modals
    docModal: document.getElementById('docModal'),
    previewModal: document.getElementById('previewModal'),
    categoryManageModal: document.getElementById('categoryManageModal'),
    memberManageModal: document.getElementById('memberManageModal'),
    loginModal: document.getElementById('loginModal'),
    aiModal: document.getElementById('aiModal'),

    // Login Elements
    sidebarMemberAvatar: document.getElementById('sidebarMemberAvatar'),
    sidebarMemberName: document.getElementById('sidebarMemberName'),
    btnSwitchMemberSidebar: document.getElementById('btnSwitchMemberSidebar'),
    currentMemberAvatar: document.getElementById('currentMemberAvatar'),
    currentMemberName: document.getElementById('currentMemberName'),
    btnCurrentMemberBadge: document.getElementById('btnCurrentMemberBadge'),
    memberLoginGrid: document.getElementById('memberLoginGrid'),
    btnCloseLoginModal: document.getElementById('btnCloseLoginModal'),
    btnManageMembersFromLogin: document.getElementById('btnManageMembersFromLogin'),

    // AI Elements
    btnOpenAiAssistant: document.getElementById('btnOpenAiAssistant'),
    btnCloseAiModal: document.getElementById('btnCloseAiModal'),
    btnAiAuditAll: document.getElementById('btnAiAuditAll'),
    btnAiFindPassports: document.getElementById('btnAiFindPassports'),
    btnAiFindInsurance: document.getElementById('btnAiFindInsurance'),
    aiChatMessages: document.getElementById('aiChatMessages'),
    aiInput: document.getElementById('aiInput'),
    btnSendAi: document.getElementById('btnSendAi'),

    // Add Doc Form
    docForm: document.getElementById('docForm'),
    docModalTitle: document.getElementById('docModalTitle'),
    editDocId: document.getElementById('editDocId'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    uploadPreview: document.getElementById('uploadPreview'),
    previewImg: document.getElementById('previewImg'),
    previewFileName: document.getElementById('previewFileName'),
    btnRemoveFile: document.getElementById('btnRemoveFile'),
    ocrStatusBox: document.getElementById('ocrStatusBox'),
    docTitle: document.getElementById('docTitle'),
    docCategory: document.getElementById('docCategory'),
    docMember: document.getElementById('docMember'),
    docExpiryDate: document.getElementById('docExpiryDate'),
    docDocNo: document.getElementById('docDocNo'),
    docTags: document.getElementById('docTags'),
    docNotes: document.getElementById('docNotes'),
    btnAiSuggestTitle: document.getElementById('btnAiSuggestTitle'),

    // Preview Elements
    previewCategoryBadge: document.getElementById('previewCategoryBadge'),
    previewTitle: document.getElementById('previewTitle'),
    previewMediaWrapper: document.getElementById('previewMediaWrapper'),
    previewStatusBanner: document.getElementById('previewStatusBanner'),
    previewMember: document.getElementById('previewMember'),
    previewExpiryDate: document.getElementById('previewExpiryDate'),
    previewDocNo: document.getElementById('previewDocNo'),
    previewCreatedAt: document.getElementById('previewCreatedAt'),
    previewTags: document.getElementById('previewTags'),
    previewNotes: document.getElementById('previewNotes'),
    previewOcrText: document.getElementById('previewOcrText'),
    btnEditFromPreview: document.getElementById('btnEditFromPreview'),
    btnShareFromPreview: document.getElementById('btnShareFromPreview'),
    btnDeleteFromPreview: document.getElementById('btnDeleteFromPreview'),

    // Manage Cat/Member List Inputs
    catManageList: document.getElementById('catManageList'),
    newCatNameInput: document.getElementById('newCatNameInput'),
    newCatIconSelect: document.getElementById('newCatIconSelect'),
    btnConfirmAddCat: document.getElementById('btnConfirmAddCat'),

    memberManageList: document.getElementById('memberManageList'),
    newMemberNameInput: document.getElementById('newMemberNameInput'),
    newMemberAvatarSelect: document.getElementById('newMemberAvatarSelect'),
    btnConfirmAddMember: document.getElementById('btnConfirmAddMember'),

    // Mobile Elements
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    sidebar: document.getElementById('sidebar')
  };

  // Helper Functions: LocalStorage
  function loadState(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveState(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage Save Error:', e);
    }
  }

  // Toast Helper
  function showToast(message, icon = 'fa-circle-check') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Expiration Status Calculator
  function getExpiryStatus(expiryDateStr) {
    if (!expiryDateStr) return { code: 'ok', label: '永久有效', days: 9999, class: 'status-ok' };
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(expiryDateStr);
    expDate.setHours(0,0,0,0);

    const diffMs = expDate - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { code: 'expired', label: `已逾期 ${Math.abs(diffDays)} 天`, days: diffDays, class: 'status-expired' };
    } else if (diffDays <= 30) {
      return { code: 'warning', label: `剩餘 ${diffDays} 天到期`, days: diffDays, class: 'status-warning' };
    } else {
      return { code: 'ok', label: `有效 (剩餘 ${diffDays} 天)`, days: diffDays, class: 'status-ok' };
    }
  }

  // Initialize App
  function init() {
    bindEvents();
    updateLoggedInMemberUI();
    renderSidebarAndPills();
    renderFamilyCalendar();
    renderDocuments();
    updateStats();

    // Start Realtime Header Clock Ticker
    startRealtimeClock();
  }

  function startRealtimeClock() {
    const clockEl = document.getElementById('headerRealtimeClock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  // Update Logged in Member Header & Sidebar Profile
  function updateLoggedInMemberUI() {
    const activeMem = members.find(m => m.id === currentLoggedInMemberId) || members[0] || { name: '全家共有', avatar: '🏠' };
    el.sidebarMemberAvatar.textContent = activeMem.avatar;
    el.sidebarMemberName.textContent = activeMem.name;
    el.currentMemberAvatar.textContent = activeMem.avatar;
    el.currentMemberName.textContent = `${activeMem.name} (登入中)`;
  }

  // Open Login Switcher Modal
  function openLoginModal() {
    if (!el.memberLoginGrid || !el.loginModal) return;
    el.memberLoginGrid.innerHTML = '';
    members.forEach(mem => {
      const isLoggedIn = mem.id === currentLoggedInMemberId;
      const card = document.createElement('div');
      card.className = `login-member-card ${isLoggedIn ? 'active' : ''}`;
      card.innerHTML = `
        <div class="login-avatar">${mem.avatar}</div>
        <div class="login-name">${mem.name}</div>
        ${isLoggedIn ? '<span class="login-active-pill"><i class="fa-solid fa-circle-check"></i> 目前登入</span>' : '<span class="login-switch-hint">點擊切換</span>'}
      `;
      card.addEventListener('click', () => {
        currentLoggedInMemberId = mem.id;
        saveState('fdb_current_member_id_v1', currentLoggedInMemberId);
        updateLoggedInMemberUI();
        renderSidebarAndPills();
        renderDocuments();
        renderFamilyCalendar();
        el.loginModal.classList.remove('active');
        showToast(`歡迎回來！已切換登入身分 Profile 為「${mem.name}」！`, 'fa-user-check');
      });
      el.memberLoginGrid.appendChild(card);
    });
    el.loginModal.classList.add('active');
  }

  // Quick Add Member directly inside Login Modal
  function handleQuickAddMemberFromLogin() {
    const input = document.getElementById('quickNewMemberName');
    const avatarSelect = document.getElementById('quickNewMemberAvatar');
    if (!input) return;

    const name = input.value.trim();
    if (!name) {
      alert('請輸入新家人的稱呼（如：阿公、妹寶、狗狗波波）！');
      return;
    }

    const newMem = {
      id: 'mem-' + Date.now(),
      name: name,
      avatar: avatarSelect ? avatarSelect.value : '👨'
    };

    members.push(newMem);
    saveState(STORAGE_MEMBERS_KEY, members);
    currentLoggedInMemberId = newMem.id;
    saveState('fdb_current_member_id_v1', currentLoggedInMemberId);

    input.value = '';
    updateLoggedInMemberUI();
    renderSidebarAndPills();
    renderDocuments();
    renderFamilyCalendar();
    openLoginModal();
    showToast(`已成功為「${newMem.name}」建立新帳號並自動切換登入！`, 'fa-user-plus');
  }

  // AI Assistant Handlers
  function openAiModal() {
    el.aiModal.classList.add('active');
  }

  function sendUserAiMessage(msg) {
    if (!msg.trim()) return;
    
    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-bubble user-bubble';
    userDiv.innerHTML = `
      <div class="chat-avatar">👤</div>
      <div class="chat-content">${msg}</div>
    `;
    el.aiChatMessages.appendChild(userDiv);
    el.aiInput.value = '';
    el.aiChatMessages.scrollTop = el.aiChatMessages.scrollHeight;

    // Simulate AI Response
    setTimeout(() => {
      const aiDiv = document.createElement('div');
      aiDiv.className = 'chat-bubble ai-bubble';
      const aiReply = generateAiAnswer(msg);
      aiDiv.innerHTML = `
        <div class="chat-avatar">🤖</div>
        <div class="chat-content"><strong>AI 小管家：</strong> ${aiReply}</div>
      `;
      el.aiChatMessages.appendChild(aiDiv);
      el.aiChatMessages.scrollTop = el.aiChatMessages.scrollHeight;
    }, 600);
  }

  function generateAiAnswer(query) {
    const q = query.toLowerCase();
    
    if (q.includes('健檢') || q.includes('到期分析') || q.includes('狀態')) {
      const expired = documents.filter(d => getExpiryStatus(d.expiryDate).code === 'expired');
      const warning = documents.filter(d => getExpiryStatus(d.expiryDate).code === 'warning');
      
      let report = `<strong>【全家文件健康診斷報告】</strong><br>`;
      report += `目前收錄總文件：<strong>${documents.length}</strong> 份。<br>`;
      
      if (expired.length > 0) {
        report += `<span class="text-danger">🔴 已過期警告 (${expired.length}件)：</span><br>`;
        expired.forEach(d => { report += `• ${d.title} (於 ${d.expiryDate} 到期)<br>`; });
      } else {
        report += `<span class="text-success">🟢 無任何已過期文件。</span><br>`;
      }

      if (warning.length > 0) {
        report += `<span class="text-warning">🟠 30天內即將到期 (${warning.length}件)：</span><br>`;
        warning.forEach(d => { report += `• ${d.title} (於 ${d.expiryDate} 到期)<br>`; });
      }

      report += `<br>💡 <em>AI 建議：請儘速安排換發已過期保單/證件，避免權益受損！</em>`;
      return report;
    }

    if (q.includes('護照')) {
      const passports = documents.filter(d => d.title.includes('護照') || (d.tags && d.tags.includes('護照')));
      if (passports.length === 0) return '目前系統中尚未登記任何護照文件檔。';
      let text = `找到 ${passports.length} 份護照記錄：<br>`;
      passports.forEach(p => {
        const status = getExpiryStatus(p.expiryDate);
        text += `• <strong>${p.title}</strong>：效期至 ${p.expiryDate || '未填寫'} (${status.label})<br>`;
      });
      return text;
    }

    if (q.includes('車險') || q.includes('保險')) {
      const ins = documents.filter(d => d.title.includes('險') || d.categoryId === 'cat-medical' || d.categoryId === 'cat-property');
      if (ins.length === 0) return '目前尚未找到保險類文件。';
      let text = `為您找到以下保險文件紀錄：<br>`;
      ins.forEach(i => {
        const status = getExpiryStatus(i.expiryDate);
        text += `• <strong>${i.title}</strong> [${status.label}] (備註: ${i.notes || '無'})<br>`;
      });
      return text;
    }

    // Generic Keyword Search in Database
    const matched = documents.filter(d => 
      d.title.toLowerCase().includes(q) || 
      (d.notes && d.notes.toLowerCase().includes(q)) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
    );

    if (matched.length > 0) {
      let text = `為您檢索到 ${matched.length} 份相關文件：<br>`;
      matched.forEach(m => {
        text += `• <strong>${m.title}</strong> (存放備註: ${m.notes || '無備註'})<br>`;
      });
      return text;
    }

    return `根據全家文件庫分析，關於「${query}」目前暫無直接匹配的記錄。您可以點擊「新增/上傳文件」將此類證件拍照歸檔！`;
  }

  // Register PWA Service Worker & Install Prompt
  let deferredInstallPrompt = null;
  function registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById('btnInstallApp');
      if (btn) btn.style.display = 'inline-flex';
    });

    const btnInstall = document.getElementById('btnInstallApp');
    if (btnInstall) {
      btnInstall.addEventListener('click', () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              showToast('已成功將「家庭文件小管家」安裝至您的手機/電腦主畫面！', 'fa-mobile-screen-button');
              btnInstall.style.display = 'none';
            }
            deferredInstallPrompt = null;
          });
        } else {
          alert('提示：在 iOS (Safari) 點擊分享選單中的「加入主畫面」，即可安裝為手機 App！');
        }
      });
    }
  }

  // Shared Family Calendar Logic powered by FullCalendar v6 Standard Engine
  let calendarInstance = null;
  let currentCalMemberFilter = 'all';

  function renderFamilyCalendar() {
    try {
      const table = document.getElementById('calendarTable');
      if (!table) return;

      if (!Array.isArray(customEvents)) {
        customEvents = [...defaultCustomEvents];
      }

      // Render Member Filter Chips
      renderCalMemberFilterChips();

      // Map customEvents + document expiration events into FullCalendar events array
      let fcEvents = [];

      // 1. Custom Family Events
      (customEvents || []).forEach(evt => {
        if (currentCalMemberFilter !== 'all' && evt.memberId && evt.memberId !== currentCalMemberFilter && evt.memberId !== 'mem-all') {
          return;
        }

        let color = '#6366f1'; // primary
        if (evt.customColor) color = evt.customColor;
        else if (evt.type === 'birthday') color = '#ec4899'; // pink
        else if (evt.type === 'medical') color = '#ef4444'; // red
        else if (evt.type === 'payment') color = '#f59e0b'; // amber
        else if (evt.type === 'vehicle') color = '#3b82f6'; // blue
        else if (evt.type === 'document') color = '#8b5cf6'; // purple
        else if (evt.type === 'custom') color = evt.customColor || '#06b6d4'; // cyan

        const displayTitle = evt.customTypeName ? `${evt.customTypeName}: ${evt.title}` : evt.title;

        fcEvents.push({
          id: evt.id,
          title: displayTitle,
          start: evt.date,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { rawObj: evt, isDoc: false }
        });
      });

      // 2. Document Expiry Events
      (documents || []).forEach(doc => {
        if (currentCalMemberFilter !== 'all' && doc.memberId && doc.memberId !== currentCalMemberFilter && doc.memberId !== 'mem-all') {
          return;
        }

        if (doc.expiryDate) {
          const s = getExpiryStatus(doc.expiryDate);
          let color = '#10b981'; // ok
          if (s.code === 'expired') color = '#ef4444';
          else if (s.code === 'warning') color = '#f59e0b';

          fcEvents.push({
            id: 'doc-evt-' + doc.id,
            title: `📄 ${doc.title} 到期`,
            start: doc.expiryDate,
            backgroundColor: color,
            borderColor: color,
            extendedProps: { rawObj: doc, isDoc: true }
          });
        }
      });

      if (typeof FullCalendar !== 'undefined') {
        if (calendarInstance) {
          calendarInstance.removeAllEventSources();
          calendarInstance.addEventSource(fcEvents);
          calendarInstance.render();
          return;
        }

        calendarInstance = new FullCalendar.Calendar(table, {
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listMonth'
          },
          buttonText: {
            today: '回到今天',
            month: '月視圖',
            week: '週視圖',
            list: '行程清單'
          },
          events: fcEvents,
          dateClick: function(info) {
            openCalEventModal(null, info.dateStr);
          },
          eventClick: function(info) {
            const props = info.event.extendedProps;
            if (props.isDoc) openPreviewModal(props.rawObj);
            else openCalEventModal(props.rawObj);
          }
        });
        calendarInstance.render();
      } else {
        // Fallback: Custom Native Grid Calendar (Ensures 100% rendering even if CDN fails)
        renderCustomFallbackCalendar(table, fcEvents);
      }
    } catch (err) {
      console.error('Error rendering FullCalendar:', err);
    }
  }

  // Native Grid Calendar Fallback Engine
  let fallbackCalYear = new Date().getFullYear();
  let fallbackCalMonth = new Date().getMonth();

  function renderCustomFallbackCalendar(table, events) {
    const today = new Date();
    const firstDay = new Date(fallbackCalYear, fallbackCalMonth, 1);
    const lastDay = new Date(fallbackCalYear, fallbackCalMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    let html = `
      <div class="custom-cal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" id="fallbackPrevMonth"><i class="fa-solid fa-chevron-left"></i> 上個月</button>
          <button class="btn btn-secondary btn-sm" id="fallbackNextMonth">下個月 <i class="fa-solid fa-chevron-right"></i></button>
          <button class="btn btn-primary btn-sm" id="fallbackTodayBtn">回到今天</button>
        </div>
        <h3 style="margin:0; font-weight:700;">${fallbackCalYear}年 ${monthNames[fallbackCalMonth]}</h3>
      </div>
      <table class="fallback-cal-table" style="width:100%; border-collapse:collapse; text-align:center;">
        <thead>
          <tr style="color:var(--text-muted); font-size:13px;">
            <th style="padding:8px;">日</th><th style="padding:8px;">一</th><th style="padding:8px;">二</th>
            <th style="padding:8px;">三</th><th style="padding:8px;">四</th><th style="padding:8px;">五</th><th style="padding:8px;">六</th>
          </tr>
        </thead>
        <tbody>
    `;

    let day = 1;
    for (let i = 0; i < 6; i++) {
      html += '<tr>';
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          html += '<td style="border:1px solid rgba(255,255,255,0.08); padding:10px; background:rgba(0,0,0,0.15);"></td>';
        } else if (day > monthLength) {
          html += '<td style="border:1px solid rgba(255,255,255,0.08); padding:10px; background:rgba(0,0,0,0.15);"></td>';
        } else {
          const dateStr = `${fallbackCalYear}-${String(fallbackCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = (day === today.getDate() && fallbackCalMonth === today.getMonth() && fallbackCalYear === today.getFullYear());
          const dayEvts = events.filter(e => e.start === dateStr);

          html += `
            <td class="fallback-day-cell" data-date="${dateStr}" style="border:1px solid rgba(255,255,255,0.08); padding:8px 4px; vertical-align:top; height:70px; cursor:pointer; background:${isToday ? 'rgba(99,102,241,0.18)' : 'transparent'};">
              <div style="font-weight:${isToday ? '800' : '600'}; color:${isToday ? 'var(--primary)' : 'var(--text-main)'}; font-size:12px;">${day}</div>
              <div style="margin-top:4px;">
                ${dayEvts.map(e => `<div style="background:${e.backgroundColor}; color:#fff; font-size:10px; padding:2px 4px; border-radius:3px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.title}</div>`).join('')}
              </div>
            </td>
          `;
          day++;
        }
      }
      html += '</tr>';
      if (day > monthLength) break;
    }

    html += '</tbody></table>';
    table.innerHTML = html;

    // Fallback Event Listeners
    document.getElementById('fallbackPrevMonth')?.addEventListener('click', () => {
      fallbackCalMonth--;
      if (fallbackCalMonth < 0) { fallbackCalMonth = 11; fallbackCalYear--; }
      renderFamilyCalendar();
    });

    document.getElementById('fallbackNextMonth')?.addEventListener('click', () => {
      fallbackCalMonth++;
      if (fallbackCalMonth > 11) { fallbackCalMonth = 0; fallbackCalYear++; }
      renderFamilyCalendar();
    });

    document.getElementById('fallbackTodayBtn')?.addEventListener('click', () => {
      fallbackCalYear = new Date().getFullYear();
      fallbackCalMonth = new Date().getMonth();
      renderFamilyCalendar();
    });

    table.querySelectorAll('.fallback-day-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const d = cell.getAttribute('data-date');
        openCalEventModal(null, d);
      });
    });
  }

  function renderCalMemberFilterChips() {
    const container = document.getElementById('calMemberFilters');
    if (!container) return;

    let html = `
      <div class="cal-member-chip ${currentCalMemberFilter === 'all' ? 'active' : ''}" data-mem="all">
        🏠 全家行程 (${(customEvents || []).length + (documents || []).filter(d => d.expiryDate).length})
      </div>
    `;

    members.forEach(mem => {
      const count = (customEvents || []).filter(e => e.memberId === mem.id).length + (documents || []).filter(d => d.expiryDate && d.memberId === mem.id).length;
      html += `
        <div class="cal-member-chip ${currentCalMemberFilter === mem.id ? 'active' : ''}" data-mem="${mem.id}">
          ${mem.avatar} ${mem.name} (${count})
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.cal-member-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentCalMemberFilter = chip.getAttribute('data-mem');
        renderFamilyCalendar();
      });
    });
  }

  // Render Agenda Schedule View (Chronological List View)
  function renderAgendaView(table, title) {
    title.textContent = '全家行程與到期預警清單 (Agenda View)';
    table.style.display = 'block';
    table.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'cal-agenda-container';

    // Combine customEvents and expiring documents
    let combined = [];

    customEvents.forEach(evt => {
      const mem = members.find(m => m.id === evt.memberId) || { name: '全家', avatar: '🏠' };
      combined.push({
        id: evt.id,
        title: evt.title,
        date: evt.date,
        typeLabel: '行事曆事件',
        badgeClass: `type-${evt.type || 'other'}`,
        memberStr: `${mem.avatar} ${mem.name}`,
        notes: evt.notes || '無額外備註',
        rawObj: evt,
        isDoc: false
      });
    });

    documents.forEach(doc => {
      if (doc.expiryDate) {
        const mem = members.find(m => m.id === doc.memberId) || { name: '全家', avatar: '🏠' };
        const status = getExpiryStatus(doc.expiryDate);
        combined.push({
          id: doc.id,
          title: `證件到期：${doc.title}`,
          date: doc.expiryDate,
          typeLabel: status.label,
          badgeClass: status.class,
          memberStr: `${mem.avatar} ${mem.name}`,
          notes: doc.notes || '請留意證件/保單有效期限',
          rawObj: doc,
          isDoc: true
        });
      }
    });

    // Sort Chronologically
    combined.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (combined.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>目前尚無任何行程與到期事件</h3></div>';
    } else {
      combined.forEach(item => {
        const dObj = new Date(item.date);
        const row = document.createElement('div');
        row.className = 'agenda-item-row';
        row.innerHTML = `
          <div class="agenda-date-badge">
            <span class="day-num">${dObj.getDate() || '1'}</span>
            <span class="month-name">${dObj.getMonth() + 1} 月</span>
          </div>
          <div class="agenda-info">
            <div class="agenda-title">${item.title}</div>
            <div class="agenda-meta">
              <span>${item.memberStr}</span>
              <span><i class="fa-solid fa-calendar-day"></i> ${item.date}</span>
              <span>${item.notes}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" data-action="open-item">
            <i class="fa-solid ${item.isDoc ? 'fa-eye' : 'fa-pen'}"></i> ${item.isDoc ? '查看文件' : '編輯事件'}
          </button>
        `;

        row.querySelector('[data-action="open-item"]').addEventListener('click', () => {
          if (item.isDoc) openPreviewModal(item.rawObj);
          else openCalEventModal(item.rawObj);
        });

        container.appendChild(row);
      });
    }

    table.appendChild(container);
  }

  // User Created Event Types Memory Storage
  const STORAGE_USER_EVENT_TYPES_KEY = 'fdb_user_custom_event_types_v1';
  let userCustomEventTypes = loadState(STORAGE_USER_EVENT_TYPES_KEY, []);

  // Open Add/Edit Calendar Event Modal
  function openCalEventModal(evtToEdit = null, prefillDate = '') {
    const modal = document.getElementById('calEventModal');
    const form = document.getElementById('calEventForm');
    const editId = document.getElementById('editCalEventId');
    const titleInput = document.getElementById('calEventTitle');
    const dateInput = document.getElementById('calEventDate');
    const typeInput = document.getElementById('calEventTypeInput');
    const colorInput = document.getElementById('calEventCustomColor');
    const memberSelect = document.getElementById('calEventMember');
    const notesInput = document.getElementById('calEventNotes');
    const btnDelete = document.getElementById('btnDeleteCalEvent');

    if (!modal) return;

    // Render Member options
    memberSelect.innerHTML = members.map(m => `<option value="${m.id}">${m.avatar} ${m.name}</option>`).join('');

    // Update Datalist Options
    updateDatalistOptions();

    const btnSendLine = document.getElementById('btnSendCalEventLine');
    const btnSyncGoogle = document.getElementById('btnSyncGoogleCal');

    if (evtToEdit) {
      document.getElementById('calEventModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 編輯行事曆事件`;
      editId.value = evtToEdit.id;
      titleInput.value = evtToEdit.title;
      dateInput.value = evtToEdit.date;
      typeInput.value = evtToEdit.customTypeName || evtToEdit.typeLabel || '📌 一般記事';
      if (colorInput) colorInput.value = evtToEdit.customColor || '#06b6d4';
      memberSelect.value = evtToEdit.memberId || members[0].id;
      notesInput.value = evtToEdit.notes || '';
      
      if (btnDelete) {
        btnDelete.style.display = 'inline-flex';
        btnDelete.onclick = () => deleteCalEvent(evtToEdit.id);
      }

      if (btnSendLine) {
        btnSendLine.style.display = 'inline-flex';
        btnSendLine.onclick = () => {
          showToast(`已手動觸發 LINE Notify 訊息發送：「${evtToEdit.title} (${evtToEdit.date})」！`, 'fa-line');
        };
      }

      if (btnSyncGoogle) {
        btnSyncGoogle.style.display = 'inline-flex';
        btnSyncGoogle.onclick = () => {
          const cleanDate = (evtToEdit.date || '').replace(/-/g, '');
          const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evtToEdit.title)}&dates=${cleanDate}/${cleanDate}&details=${encodeURIComponent(evtToEdit.notes || '家庭小管家行事曆事件')}`;
          window.open(gUrl, '_blank');
        };
      }
    } else {
      document.getElementById('calEventModalTitle').innerHTML = `<i class="fa-solid fa-calendar-plus"></i> 新增家庭行事曆事件`;
      form.reset();
      editId.value = '';
      dateInput.value = prefillDate || new Date().toISOString().split('T')[0];
      typeInput.value = '';
      if (colorInput) colorInput.value = '#06b6d4';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnSendLine) btnSendLine.style.display = 'none';
      if (btnSyncGoogle) btnSyncGoogle.style.display = 'none';
    }

    modal.classList.add('active');
  }

  function updateDatalistOptions() {
    const datalist = document.getElementById('calEventTypeOptions');
    if (!datalist) return;

    const builtInOptions = [
      '🎉 慶生節慶',
      '🏥 醫療健檢',
      '💳 繳費/財務',
      '🚗 車輛維護',
      '📄 證件/合約',
      '📌 一般記事',
      '🏕️ 露營旅遊',
      '🐾 寵物保養',
      '🏋️ 健身運動'
    ];

    let allOptions = [...builtInOptions];
    (userCustomEventTypes || []).forEach(ct => {
      if (ct && ct.name && !allOptions.includes(ct.name)) {
        allOptions.push(ct.name);
      }
    });

    datalist.innerHTML = allOptions.map(opt => `<option value="${opt}"></option>`).join('');
  }

  function deleteCalEvent(eventId) {
    const evt = customEvents.find(e => e.id === eventId);
    if (evt && confirm(`確定要刪除行程事件「${evt.title}」嗎？`)) {
      customEvents = customEvents.filter(e => e.id !== eventId);
      saveState(STORAGE_EVENTS_KEY, customEvents);
      document.getElementById('calEventModal').classList.remove('active');
      renderFamilyCalendar();
      showToast(`已刪除行事曆事件「${evt.title}」`, 'fa-trash-can');
    }
  }

  // Safe Event Binding Helper (Prevents any uncaught JS TypeError crash)
  function safeBind(target, event, handler) {
    if (!target) return;
    let element = typeof target === 'string' ? document.getElementById(target) : target;
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  // Bind UI Event Handlers
  function bindEvents() {
    // Navigation items
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const filterType = item.getAttribute('data-filter-type');
        const calSection = document.getElementById('calendarSection');

        if (filterType === 'all') {
          resetFilters();
          if (calSection) calSection.style.display = 'block';
        } else if (filterType === 'calendar') {
          if (calSection) {
            calSection.style.display = 'block';
            renderFamilyCalendar();
            calSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (filterType === 'alert') {
          currentStatusFilter = 'alert';
          renderDocuments();
          if (document.getElementById('documentsContainer')) {
            document.getElementById('documentsContainer').scrollIntoView({ behavior: 'smooth' });
          }
        } else if (filterType === 'recent') {
          if (el.sortSelect) el.sortSelect.value = 'created-desc';
          renderDocuments();
        }
      });
    });

    // Mobile Bottom Tab Bar Click Handlers
    document.querySelectorAll('.mobile-bottom-nav .nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.mobile-bottom-nav .nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabType = tab.getAttribute('data-tab');
        const calSection = document.getElementById('calendarSection');
        const docsContainer = document.getElementById('documentsContainer');

        if (tabType === 'calendar') {
          if (calSection) {
            calSection.style.display = 'block';
            renderFamilyCalendar();
            setTimeout(() => {
              if (calendarInstance) calendarInstance.updateSize();
            }, 100);
            calSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (tabType === 'all') {
          resetFilters();
          if (calSection) calSection.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tabType === 'alert') {
          currentStatusFilter = 'alert';
          renderDocuments();
          if (docsContainer) docsContainer.scrollIntoView({ behavior: 'smooth' });
        } else if (tabType === 'members') {
          openLoginModal();
        }
      });
    });

    // Calendar View Mode Switcher Triggers
    const btnViewMonth = document.getElementById('calViewMonthBtn');
    const btnViewWeek = document.getElementById('calViewWeekBtn');
    const btnViewAgenda = document.getElementById('calViewAgendaBtn');

    if (btnViewMonth) {
      btnViewMonth.addEventListener('click', () => {
        calendarViewMode = 'month';
        btnViewMonth.classList.add('active');
        if (btnViewWeek) btnViewWeek.classList.remove('active');
        if (btnViewAgenda) btnViewAgenda.classList.remove('active');
        renderFamilyCalendar();
      });
    }

    if (btnViewWeek) {
      btnViewWeek.addEventListener('click', () => {
        calendarViewMode = 'week';
        btnViewWeek.classList.add('active');
        if (btnViewMonth) btnViewMonth.classList.remove('active');
        if (btnViewAgenda) btnViewAgenda.classList.remove('active');
        renderFamilyCalendar();
      });
    }

    if (btnViewAgenda) {
      btnViewAgenda.addEventListener('click', () => {
        calendarViewMode = 'agenda';
        btnViewAgenda.classList.add('active');
        if (btnViewMonth) btnViewMonth.classList.remove('active');
        if (btnViewWeek) btnViewWeek.classList.remove('active');
        renderFamilyCalendar();
      });
    }

    // Quick Smart Calendar Input
    safeBind('btnSubmitQuickCal', 'click', handleQuickCalSubmit);
    safeBind('quickCalInput', 'keypress', (e) => {
      if (e.key === 'Enter') handleQuickCalSubmit();
    });

    // Shared Family Calendar Events
    safeBind('btnOpenCalendarStat', 'click', () => {
      const calSection = document.getElementById('calendarSection');
      if (calSection) {
        calSection.style.display = 'block';
        renderFamilyCalendar();
        calSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    safeBind('btnCloseCalendarView', 'click', () => {
      const calSection = document.getElementById('calendarSection');
      if (calSection) calSection.style.display = 'none';
    });

    safeBind('btnCalToday', 'click', () => {
      const todayNow = new Date();
      currentCalYear = todayNow.getFullYear();
      currentCalMonth = todayNow.getMonth();
      renderFamilyCalendar();
      showToast('已回到目前當月 Today 行事曆視圖！', 'fa-location-crosshairs');
    });

    safeBind('btnResetCalData', 'click', () => {
      if (confirm('確定要修復並重置行事曆與快取資料嗎？')) {
        localStorage.removeItem(STORAGE_EVENTS_KEY);
        customEvents = [...defaultCustomEvents];
        saveState(STORAGE_EVENTS_KEY, customEvents);
        renderFamilyCalendar();
        showToast('行事曆資料與快取已修復並重置為最新版！', 'fa-wrench');
      }
    });

    safeBind('btnPrevMonth', 'click', () => {
      currentCalMonth--;
      if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
      renderFamilyCalendar();
    });

    safeBind('btnNextMonth', 'click', () => {
      currentCalMonth++;
      if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
      renderFamilyCalendar();
    });

    safeBind('btnLineNotifySetup', 'click', () => {
      showToast('LINE 群組到期自動推播提醒已運作中！每日上午 9:00 自動發送到期警告通知。', 'fa-line');
    });

    safeBind('btnExportIcs', 'click', exportIcsFile);

    // Quick Add Calendar Event Trigger
    safeBind('btnQuickAddCalEvent', 'click', () => openCalEventModal());
    safeBind('btnCloseCalEventModal', 'click', () => {
      const modal = document.getElementById('calEventModal');
      if (modal) modal.classList.remove('active');
    });
    safeBind('btnCancelCalEventModal', 'click', () => {
      const modal = document.getElementById('calEventModal');
      if (modal) modal.classList.remove('active');
    });

    // Custom Calendar Event Form Submit
    const calEventForm = document.getElementById('calEventForm');
    if (calEventForm) {
      calEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editCalEventId').value;
        const title = document.getElementById('calEventTitle').value.trim();
        const date = document.getElementById('calEventDate').value;
        const typeInputVal = document.getElementById('calEventTypeInput').value.trim() || '📌 一般記事';
        const memberId = document.getElementById('calEventMember').value;
        const notes = document.getElementById('calEventNotes').value.trim();
        const customColorInput = document.getElementById('calEventCustomColor');
        const customColor = customColorInput ? customColorInput.value : '#06b6d4';

        if (!title || !date) {
          alert('請輸入事件名稱與日期！');
          return;
        }

        if (id) {
          const evt = customEvents.find(ev => ev.id === id);
          if (evt) {
            evt.title = title;
            evt.date = date;
            evt.type = 'custom';
            evt.customTypeName = typeInputVal;
            evt.customColor = customColor;
            evt.memberId = memberId;
            evt.notes = notes;
          }
          showToast(`已成功更新行程「${typeInputVal}: ${title}」！`);
        } else {
          const newEvt = {
            id: 'evt-' + Date.now(),
            title,
            date,
            type: 'custom',
            customTypeName: typeInputVal,
            customColor: customColor,
            memberId,
            notes
          };
          customEvents.push(newEvt);
          showToast(`已新增行程「${typeInputVal}: ${title}」至 ${date}！`);
        }

        saveState(STORAGE_EVENTS_KEY, customEvents);
        const modal = document.getElementById('calEventModal');
        if (modal) modal.classList.remove('active');
        renderFamilyCalendar();
      });
    }

    // Netflix/Spotify Auth Tab Switcher Handlers
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-tab-content').forEach(c => {
          c.classList.remove('active');
          c.style.display = 'none';
        });

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-authtab');
        const targetContent = document.getElementById(targetTab === 'social' ? 'authContentSocial' : targetTab === 'profiles' ? 'authContentProfiles' : 'authContentPin');
        if (targetContent) {
          targetContent.classList.add('active');
          targetContent.style.display = 'block';
        }
      });
    });

    // Social OAuth Login Simulators with Instant Modal Close & Login State
    safeBind('btnLineLogin', 'click', () => {
      showToast('正在進行 LINE 快速安全驗證...', 'fa-line');
      setTimeout(() => {
        currentLoggedInMemberId = members[0] ? members[0].id : 'mem-dad';
        saveState('fdb_current_member_id_v1', currentLoggedInMemberId);
        updateLoggedInMemberUI();
        renderSidebarAndPills();
        renderDocuments();
        renderFamilyCalendar();
        if (el.loginModal) el.loginModal.classList.remove('active');
        showToast('LINE 帳號登入成功！已驗證全域權限並載入個人文件庫', 'fa-circle-check');
      }, 600);
    });

    safeBind('btnGoogleLogin', 'click', () => {
      showToast('正在與 Google 帳號及 Google Drive 完成連線...', 'fa-google');
      setTimeout(() => {
        currentLoggedInMemberId = members[0] ? members[0].id : 'mem-dad';
        saveState('fdb_current_member_id_v1', currentLoggedInMemberId);
        updateLoggedInMemberUI();
        renderSidebarAndPills();
        renderDocuments();
        renderFamilyCalendar();
        if (el.loginModal) el.loginModal.classList.remove('active');
        showToast('Google 帳號連結成功！已啟動家庭文件雙向自動備份', 'fa-cloud-arrow-up');
      }, 600);
    });

    safeBind('btnAppleLogin', 'click', () => {
      showToast('正在透過 Apple ID 與 Passkey 安全加密驗證...', 'fa-apple');
      setTimeout(() => {
        currentLoggedInMemberId = members[0] ? members[0].id : 'mem-dad';
        saveState('fdb_current_member_id_v1', currentLoggedInMemberId);
        updateLoggedInMemberUI();
        renderSidebarAndPills();
        renderDocuments();
        renderFamilyCalendar();
        if (el.loginModal) el.loginModal.classList.remove('active');
        showToast('Apple ID 驗證成功！已建立專屬加密金鑰連線', 'fa-shield-halved');
      }, 600);
    });

    // 4-Digit PIN Code Auto-Focus & Unlock Simulation
    const pinInputs = [document.getElementById('pinDigit1'), document.getElementById('pinDigit2'), document.getElementById('pinDigit3'), document.getElementById('pinDigit4')];
    pinInputs.forEach((input, index) => {
      if (input) {
        input.addEventListener('input', () => {
          if (input.value.length === 1 && index < 3 && pinInputs[index + 1]) {
            pinInputs[index + 1].focus();
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value && index > 0 && pinInputs[index - 1]) {
            pinInputs[index - 1].focus();
          }
        });
      }
    });

    safeBind('btnSubmitPinUnlock', 'click', () => {
      const pinCode = pinInputs.map(i => i ? i.value : '').join('');
      if (pinCode.length < 4) {
        alert('請填滿 4 位數 PIN 安全解鎖碼！');
        return;
      }
      showToast('PIN 碼驗證成功！已進入全家私密文件庫沙盒', 'fa-lock-open');
      if (el.loginModal) el.loginModal.classList.remove('active');
    });

    // Login Switcher & Quick Member Add Triggers
    safeBind(el.btnSwitchMemberSidebar, 'click', openLoginModal);
    safeBind(el.btnCurrentMemberBadge, 'click', openLoginModal);
    safeBind(el.btnCloseLoginModal, 'click', () => el.loginModal && el.loginModal.classList.remove('active'));
    safeBind(el.btnManageMembersFromLogin, 'click', () => {
      if (el.loginModal) el.loginModal.classList.remove('active');
      openMemberManageModal();
    });

    safeBind('btnConfirmQuickAddMember', 'click', handleQuickAddMemberFromLogin);
    safeBind('quickNewMemberName', 'keypress', (e) => {
      if (e.key === 'Enter') handleQuickAddMemberFromLogin();
    });

    // AI Assistant Modal Triggers
    safeBind('btnAiAuditTop', 'click', () => {
      openAiModal();
      sendUserAiMessage('請幫全家進行文件健檢與到期分析');
    });

    safeBind(el.btnOpenAiAssistant, 'click', openAiModal);
    safeBind(el.btnCloseAiModal, 'click', () => el.aiModal && el.aiModal.classList.remove('active'));
    safeBind(el.btnSendAi, 'click', () => el.aiInput && sendUserAiMessage(el.aiInput.value));
    safeBind(el.aiInput, 'keypress', (e) => {
      if (e.key === 'Enter' && el.aiInput) sendUserAiMessage(el.aiInput.value);
    });

    safeBind(el.btnAiAuditAll, 'click', () => sendUserAiMessage('請幫全家進行文件健檢與到期分析'));
    safeBind(el.btnAiFindPassports, 'click', () => sendUserAiMessage('誰的護照快到期了？'));
    safeBind(el.btnAiFindInsurance, 'click', () => sendUserAiMessage('檢查車險與保單狀態'));

    // Mobile Sidebar Toggle
    const toggleMobileSidebar = () => {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar) {
        const isOpen = sidebar.classList.toggle('mobile-open');
        if (overlay) {
          if (isOpen) overlay.classList.add('active');
          else overlay.classList.remove('active');
        }
      }
    };

    document.querySelectorAll('#mobileMenuBtn, .mobile-menu-btn, .mobile-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileSidebar();
      });
    });

    safeBind('sidebarOverlay', 'click', toggleMobileSidebar);

    // Add Document Buttons
    document.querySelectorAll('#btnOpenAddDoc, #btnOpenAddDocTop, #btnEmptyAdd, #btnFabAdd').forEach(btn => {
      if (btn) btn.addEventListener('click', () => openDocModal());
    });

    // Close Modals
    safeBind('btnCloseDocModal', 'click', closeDocModal);
    safeBind('btnCancelDocModal', 'click', closeDocModal);
    safeBind('btnClosePreviewModal', 'click', closePreviewModal);
    safeBind('btnCloseCatModal', 'click', () => el.categoryManageModal && el.categoryManageModal.classList.remove('active'));
    safeBind('btnDoneCatModal', 'click', () => el.categoryManageModal && el.categoryManageModal.classList.remove('active'));
    safeBind('btnCloseMemberModal', 'click', () => el.memberManageModal && el.memberManageModal.classList.remove('active'));
    safeBind('btnDoneMemberModal', 'click', () => el.memberManageModal && el.memberManageModal.classList.remove('active'));

    // Manage Categories Modal Trigger
    document.querySelectorAll('#btnManageCategories, #btnManageCategoriesTop, #btnAddCategoryQuick').forEach(btn => {
      if (btn) btn.addEventListener('click', () => openCategoryManageModal());
    });

    // Manage Members Modal Trigger
    document.querySelectorAll('#btnManageMembers, #btnManageMembersTop, #btnAddMemberQuick').forEach(btn => {
      if (btn) btn.addEventListener('click', () => openMemberManageModal());
    });

    // Search Box
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (el.clearSearchBtn) el.clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        renderDocuments();
      });
    }

    safeBind(el.clearSearchBtn, 'click', () => {
      if (el.searchInput) el.searchInput.value = '';
      searchQuery = '';
      if (el.clearSearchBtn) el.clearSearchBtn.style.display = 'none';
      renderDocuments();
    });

    // Sort Select
    safeBind(el.sortSelect, 'change', () => renderDocuments());

    // View Toggle
    safeBind(el.viewGridBtn, 'click', () => {
      viewMode = 'grid';
      if (el.viewGridBtn) el.viewGridBtn.classList.add('active');
      if (el.viewListBtn) el.viewListBtn.classList.remove('active');
      if (el.documentsContainer) el.documentsContainer.className = 'documents-container grid-view';
    });

    safeBind(el.viewListBtn, 'click', () => {
      viewMode = 'list';
      if (el.viewListBtn) el.viewListBtn.classList.add('active');
      if (el.viewGridBtn) el.viewGridBtn.classList.remove('active');
      if (el.documentsContainer) el.documentsContainer.className = 'documents-container list-view';
    });

    // Stat Cards Clicks
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.getAttribute('data-stat-click');
        if (type === 'all') resetFilters();
        else if (type === 'expired') { currentStatusFilter = 'expired'; renderDocuments(); }
        else if (type === 'expiring') { currentStatusFilter = 'alert'; renderDocuments(); }
        else if (type === 'categories') openCategoryManageModal();
      });
    });

    // Add Category Confirm
    el.btnConfirmAddCat.addEventListener('click', handleAddCategory);
    // Add Member Confirm
    el.btnConfirmAddMember.addEventListener('click', handleAddMember);

    // Dropzone Upload Simulation
    el.dropzone.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', handleFileSelect);

    el.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.dropzone.style.borderColor = 'var(--primary)';
    });
    el.dropzone.addEventListener('dragleave', () => {
      el.dropzone.style.borderColor = 'rgba(99, 102, 241, 0.4)';
    });
    el.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      el.dropzone.style.borderColor = 'rgba(99, 102, 241, 0.4)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        el.fileInput.files = e.dataTransfer.files;
        handleFileSelect();
      }
    });

    el.btnRemoveFile.addEventListener('click', (e) => {
      e.stopPropagation();
      resetUploadPreview();
    });

    // AI Suggest Title
    el.btnAiSuggestTitle.addEventListener('click', suggestAiTitle);

    // Save Doc Form Submit
    el.docForm.addEventListener('submit', handleSaveDoc);
  }

  // Reset Filters
  function resetFilters() {
    currentCategoryFilter = 'all';
    currentMemberFilter = 'all';
    currentStatusFilter = 'all';
    searchQuery = '';
    el.searchInput.value = '';
    el.clearSearchBtn.style.display = 'none';
    renderSidebarAndPills();
    renderDocuments();
  }

  // Render Sidebar Category & Member Items + Top Horizontal Pills
  function renderSidebarAndPills() {
    // 1. Sidebar Categories
    el.sidebarCategories.innerHTML = '';
    categories.forEach(cat => {
      const count = documents.filter(d => d.categoryId === cat.id).length;
      const a = document.createElement('a');
      a.href = '#';
      a.className = `menu-item ${currentCategoryFilter === cat.id ? 'active' : ''}`;
      a.innerHTML = `
        <i class="fa-solid ${cat.icon}"></i>
        <span>${cat.name}</span>
        <span class="badge">${count}</span>
      `;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategoryFilter = cat.id;
        currentStatusFilter = 'all';
        renderSidebarAndPills();
        renderDocuments();
      });
      el.sidebarCategories.appendChild(a);
    });

    // 2. Sidebar Members
    el.sidebarMembers.innerHTML = '';
    members.forEach(mem => {
      const count = documents.filter(d => d.memberId === mem.id).length;
      const a = document.createElement('a');
      a.href = '#';
      a.className = `menu-item ${currentMemberFilter === mem.id ? 'active' : ''}`;
      a.innerHTML = `
        <span>${mem.avatar}</span>
        <span>${mem.name}</span>
        <span class="badge">${count}</span>
      `;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        currentMemberFilter = mem.id;
        currentStatusFilter = 'all';
        renderSidebarAndPills();
        renderDocuments();
      });
      el.sidebarMembers.appendChild(a);
    });

    // 3. Category Horizontal Pills
    el.categoryPills.innerHTML = '';
    
    // All Pill
    const allPill = document.createElement('div');
    allPill.className = `pill-item ${currentCategoryFilter === 'all' ? 'active' : ''}`;
    allPill.innerHTML = `<i class="fa-solid fa-layer-group"></i> 檢視全部`;
    allPill.addEventListener('click', () => {
      currentCategoryFilter = 'all';
      renderSidebarAndPills();
      renderDocuments();
    });
    el.categoryPills.appendChild(allPill);

    categories.forEach(cat => {
      const pill = document.createElement('div');
      pill.className = `pill-item ${currentCategoryFilter === cat.id ? 'active' : ''}`;
      pill.innerHTML = `<i class="fa-solid ${cat.icon}"></i> ${cat.name}`;
      pill.addEventListener('click', () => {
        currentCategoryFilter = cat.id;
        renderSidebarAndPills();
        renderDocuments();
      });
      el.categoryPills.appendChild(pill);
    });

    // Quick Add Pill
    const addPill = document.createElement('div');
    addPill.className = 'pill-item';
    addPill.style.borderStyle = 'dashed';
    addPill.innerHTML = `<i class="fa-solid fa-plus text-primary"></i> 新增分類`;
    addPill.addEventListener('click', openCategoryManageModal);
    el.categoryPills.appendChild(addPill);
  }

  // Render Documents Grid / List
  function renderDocuments() {
    el.documentsContainer.innerHTML = '';

    // Filter Logic
    let filtered = documents.filter(doc => {
      // Category Filter
      if (currentCategoryFilter !== 'all' && doc.categoryId !== currentCategoryFilter) return false;
      // Member Filter
      if (currentMemberFilter !== 'all' && doc.memberId !== currentMemberFilter) return false;

      // Status Filter
      const status = getExpiryStatus(doc.expiryDate);
      if (currentStatusFilter === 'alert' && status.code === 'ok') return false;
      if (currentStatusFilter === 'expired' && status.code !== 'expired') return false;

      // Search Query
      if (searchQuery) {
        const titleMatch = doc.title.toLowerCase().includes(searchQuery);
        const docNoMatch = doc.docNo && doc.docNo.toLowerCase().includes(searchQuery);
        const tagsMatch = doc.tags && doc.tags.some(t => t.toLowerCase().includes(searchQuery));
        const notesMatch = doc.notes && doc.notes.toLowerCase().includes(searchQuery);
        if (!titleMatch && !docNoMatch && !tagsMatch && !notesMatch) return false;
      }

      return true;
    });

    // Sorting Logic
    const sortVal = el.sortSelect.value;
    filtered.sort((a, b) => {
      if (sortVal === 'expiry-asc') {
        const daysA = getExpiryStatus(a.expiryDate).days;
        const daysB = getExpiryStatus(b.expiryDate).days;
        return daysA - daysB;
      } else if (sortVal === 'created-desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortVal === 'title-asc') {
        return a.title.localeCompare(b.title, 'zh-TW');
      }
      return 0;
    });

    // Title text update
    if (currentCategoryFilter !== 'all') {
      const cat = categories.find(c => c.id === currentCategoryFilter);
      el.currentFilterTitle.textContent = cat ? `分類：${cat.name}` : '全部文件';
    } else if (currentMemberFilter !== 'all') {
      const mem = members.find(m => m.id === currentMemberFilter);
      el.currentFilterTitle.textContent = mem ? `成員：${mem.name}` : '全部文件';
    } else if (currentStatusFilter === 'alert') {
      el.currentFilterTitle.textContent = '到期預警文件檔';
    } else {
      el.currentFilterTitle.textContent = '全部文件檔';
    }

    // Toggle Empty State
    if (filtered.length === 0) {
      el.emptyState.style.display = 'block';
    } else {
      el.emptyState.style.display = 'none';

      filtered.forEach(doc => {
        const cat = categories.find(c => c.id === doc.categoryId) || { name: '未分類', icon: 'fa-folder' };
        const mem = members.find(m => m.id === doc.memberId) || { name: '全家', avatar: '🏠' };
        const status = getExpiryStatus(doc.expiryDate);

        const card = document.createElement('div');
        card.className = 'doc-card';
        card.innerHTML = `
          <div class="doc-card-top">
            <div class="doc-icon-preview">
              ${doc.fileUrl ? `<img src="${doc.fileUrl}" alt="預覽">` : `<i class="fa-solid ${cat.icon}"></i>`}
            </div>
            <div class="doc-card-info">
              <div class="doc-title-row">
                <span class="doc-title" title="點擊預覽 ${doc.title}">${doc.title}</span>
                <i class="fa-solid fa-pen-to-square doc-rename-icon" title="重命名此文件" data-action="rename"></i>
              </div>
              <div class="doc-meta">
                <span class="member-pill">${mem.avatar} ${mem.name}</span>
                <span>${cat.name}</span>
              </div>
            </div>
          </div>

          <div class="status-badge ${status.class}">
            <i class="fa-solid ${status.code === 'expired' ? 'fa-circle-exclamation' : status.code === 'warning' ? 'fa-clock' : 'fa-circle-check'}"></i>
            <span>${status.label}</span>
          </div>

          <div class="doc-card-bottom">
            <span><i class="fa-solid fa-calendar-days"></i> ${doc.expiryDate || '永久有效'}</span>
            <div class="doc-actions">
              <button class="action-btn" title="查看與預覽" data-action="preview"><i class="fa-solid fa-eye"></i></button>
              <button class="action-btn" title="編輯/重命名" data-action="edit"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn delete-btn" title="刪除" data-action="delete"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>
        `;

        // Card Action Events
        card.querySelector('.doc-title').addEventListener('click', () => openPreviewModal(doc));
        card.querySelector('[data-action="preview"]').addEventListener('click', () => openPreviewModal(doc));
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openDocModal(doc));
        card.querySelector('[data-action="rename"]').addEventListener('click', (e) => {
          e.stopPropagation();
          quickRenameDocument(doc);
        });
        card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteDocument(doc.id));

        el.documentsContainer.appendChild(card);
      });
    }
  }

  // Update Summary Dashboard Statistics
  function updateStats() {
    const total = documents.length;
    let expiredCount = 0;
    let expiringCount = 0;

    documents.forEach(doc => {
      const s = getExpiryStatus(doc.expiryDate);
      if (s.code === 'expired') expiredCount++;
      else if (s.code === 'warning') expiringCount++;
    });

    el.statTotal.textContent = total;
    el.statExpired.textContent = expiredCount;
    el.statExpiring.textContent = expiringCount;
    el.statCategories.textContent = categories.length;

    el.badgeTotalDocs.textContent = total;
    el.badgeAlertDocs.textContent = expiredCount + expiringCount;
  }

  // Quick Rename Function (Single Click Direct Rename)
  function quickRenameDocument(doc) {
    const newTitle = prompt('請輸入新的文件名稱：', doc.title);
    if (newTitle !== null && newTitle.trim() !== '') {
      doc.title = newTitle.trim();
      saveState(STORAGE_DOCS_KEY, documents);
      renderDocuments();
      showToast(`已成功將文件重命名為「${doc.title}」`);
    }
  }

  // File Upload Handlers
  function handleFileSelect() {
    const file = el.fileInput.files[0];
    if (file) {
      selectedFileObj = file;
      el.uploadPreview.style.display = 'flex';
      el.previewFileName.textContent = file.name;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => { el.previewImg.src = e.target.result; };
        reader.readAsDataURL(file);
      } else {
        el.previewImg.src = 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80';
      }

      // Trigger AI OCR Scan Laser Animation Beam
      if (el.dropzone) el.dropzone.classList.add('scanning');
      el.ocrStatusBox.style.display = 'flex';

      setTimeout(() => {
        if (el.dropzone) el.dropzone.classList.remove('scanning');
        el.ocrStatusBox.style.display = 'none';
        // Auto fill sample values if empty
        if (!el.docTitle.value) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          el.docTitle.value = cleanName;
        }
        showToast('AI 已成功完成證件 OCR 雷射掃描與特徵提取！', 'fa-wand-magic-sparkles');
      }, 1500);
    }
  }

  function resetUploadPreview() {
    selectedFileObj = null;
    el.fileInput.value = '';
    el.uploadPreview.style.display = 'none';
    el.previewImg.src = '';
  }

  function suggestAiTitle() {
    const suggestions = [
      '房屋地方稅與地價稅繳款單',
      '全家戶口名簿影本',
      '車輛定期檢驗合格證',
      '學位證書與英檢成績單',
      '疫苗接種紀錄與黃卡'
    ];
    const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    el.docTitle.value = picked;
    showToast(`已套用 AI 建議檔名：「${picked}」`, 'fa-wand-magic-sparkles');
  }

  // Open / Close Modals
  function openDocModal(docToEdit = null) {
    // Populate Select Options
    el.docCategory.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    el.docMember.innerHTML = members.map(m => `<option value="${m.id}">${m.avatar} ${m.name}</option>`).join('');

    if (docToEdit) {
      el.docModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 編輯/改名文件`;
      el.editDocId.value = docToEdit.id;
      el.docTitle.value = docToEdit.title;
      el.docCategory.value = docToEdit.categoryId;
      el.docMember.value = docToEdit.memberId;
      el.docExpiryDate.value = docToEdit.expiryDate || '';
      el.docDocNo.value = docToEdit.docNo || '';
      el.docTags.value = docToEdit.tags ? docToEdit.tags.join(', ') : '';
      el.docNotes.value = docToEdit.notes || '';
    } else {
      el.docModalTitle.innerHTML = `<i class="fa-solid fa-file-circle-plus"></i> 新增家庭文件`;
      el.docForm.reset();
      el.editDocId.value = '';
      resetUploadPreview();
    }

    el.docModal.classList.add('active');
  }

  function closeDocModal() {
    el.docModal.classList.remove('active');
  }

  // Save Doc (Add or Edit)
  function handleSaveDoc(e) {
    e.preventDefault();
    const id = el.editDocId.value;
    const title = el.docTitle.value.trim();
    const categoryId = el.docCategory.value;
    const memberId = el.docMember.value;
    const expiryDate = el.docExpiryDate.value;
    const docNo = el.docDocNo.value.trim();
    const tagsStr = el.docTags.value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
    const notes = el.docNotes.value.trim();

    let imgUrl = selectedFileObj && el.previewImg.src ? el.previewImg.src : '';

    if (id) {
      // Edit
      const doc = documents.find(d => d.id === id);
      if (doc) {
        doc.title = title;
        doc.categoryId = categoryId;
        doc.memberId = memberId;
        doc.expiryDate = expiryDate;
        doc.docNo = docNo;
        doc.tags = tags;
        doc.notes = notes;
        if (imgUrl) doc.fileUrl = imgUrl;
      }
      showToast(`「${title}」更新成功！`);
    } else {
      // Add New
      const newDoc = {
        id: 'doc-' + Date.now(),
        title,
        categoryId,
        memberId,
        expiryDate,
        docNo,
        tags,
        notes,
        ocrText: `AI 自動掃描內容 (${title}) / 單號: ${docNo || '無'}`,
        fileType: 'image',
        fileUrl: imgUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().split('T')[0]
      };
      documents.unshift(newDoc);
      showToast(`成功新增文件「${title}」！`);
    }

    saveState(STORAGE_DOCS_KEY, documents);
    closeDocModal();
    renderSidebarAndPills();
    renderDocuments();
    updateStats();
  }

  // Preview Modal Logic
  function openPreviewModal(doc) {
    const cat = categories.find(c => c.id === doc.categoryId) || { name: '文件' };
    const mem = members.find(m => m.id === doc.memberId) || { name: '全家', avatar: '🏠' };
    const status = getExpiryStatus(doc.expiryDate);

    el.previewCategoryBadge.textContent = cat.name;
    el.previewTitle.textContent = doc.title;
    el.previewMember.textContent = `${mem.avatar} ${mem.name}`;
    el.previewExpiryDate.textContent = doc.expiryDate || '永久有效';
    el.previewDocNo.textContent = doc.docNo || '無填寫';
    el.previewCreatedAt.textContent = doc.createdAt || '2026-08-31';
    el.previewNotes.textContent = doc.notes || '無額外備註';
    el.previewOcrText.textContent = doc.ocrText || '加密分析中...';

    // Status Banner
    el.previewStatusBanner.className = `status-banner ${status.class}`;
    el.previewStatusBanner.innerHTML = `<i class="fa-solid fa-clock"></i> 狀態提醒：${status.label}`;

    // Media Wrapper
    el.previewMediaWrapper.innerHTML = doc.fileUrl 
      ? `<img src="${doc.fileUrl}" alt="${doc.title}">` 
      : `<i class="fa-solid ${cat.icon}" style="font-size: 80px; color: var(--primary);"></i>`;

    // Tags
    el.previewTags.innerHTML = doc.tags && doc.tags.length > 0 
      ? doc.tags.map(t => `<span class="member-pill"># ${t}</span>`).join(' ') 
      : '<span class="text-muted">無標籤</span>';

    // Action Buttons
    el.btnEditFromPreview.onclick = () => { closePreviewModal(); openDocModal(doc); };
    el.btnDeleteFromPreview.onclick = () => { closePreviewModal(); deleteDocument(doc.id); };
    el.btnShareFromPreview.onclick = () => {
      showToast('已複製防偽安全分享連結，可直接貼至 LINE 群組！', 'fa-share-nodes');
    };

    el.previewModal.classList.add('active');
  }

  function closePreviewModal() {
    el.previewModal.classList.remove('active');
  }

  // Delete Document
  function deleteDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc && confirm(`確定要刪除「${doc.title}」這份文件嗎？刪除後無法復原。`)) {
      documents = documents.filter(d => d.id !== docId);
      saveState(STORAGE_DOCS_KEY, documents);
      renderSidebarAndPills();
      renderDocuments();
      updateStats();
      showToast('文件已成功刪除', 'fa-trash-can');
    }
  }

  // ==========================================================================
  // Category Management & Dynamic Renaming
  // ==========================================================================
  function openCategoryManageModal() {
    renderCategoryManageList();
    const modal = document.getElementById('categoryManageModal') || el.categoryManageModal;
    if (modal) modal.classList.add('active');
  }

  function renderCategoryManageList() {
    const listEl = document.getElementById('catManageList') || el.catManageList;
    if (!listEl) return;
    listEl.innerHTML = '';
    categories.forEach(cat => {
      const row = document.createElement('div');
      row.className = 'manage-item-row';
      row.innerHTML = `
        <i class="fa-solid ${cat.icon} text-primary" style="width: 24px; text-align: center;"></i>
        <input type="text" class="form-control" value="${cat.name}" data-cat-id="${cat.id}">
        <button class="btn btn-secondary btn-sm" data-action="save-name"><i class="fa-solid fa-floppy-disk"></i> 改名</button>
        <button class="btn btn-danger-soft btn-sm" data-action="delete"><i class="fa-solid fa-trash"></i></button>
      `;

      // Save Name
      row.querySelector('[data-action="save-name"]').addEventListener('click', () => {
        const inputVal = row.querySelector('input').value.trim();
        if (inputVal) {
          cat.name = inputVal;
          saveState(STORAGE_CATS_KEY, categories);
          renderSidebarAndPills();
          renderDocuments();
          updateStats();
          showToast(`分類名稱已更改為「${inputVal}」`);
        }
      });

      // Delete Cat
      row.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (categories.length <= 1) {
          alert('請至少保留一個文件分類！');
          return;
        }
        if (confirm(`確定要刪除分類「${cat.name}」嗎？`)) {
          categories = categories.filter(c => c.id !== cat.id);
          saveState(STORAGE_CATS_KEY, categories);
          renderCategoryManageList();
          renderSidebarAndPills();
          renderDocuments();
          updateStats();
          showToast('分類已刪除', 'fa-trash-can');
        }
      });

      listEl.appendChild(row);
    });
  }

  function handleAddCategory() {
    const input = document.getElementById('newCatNameInput') || el.newCatNameInput;
    const select = document.getElementById('newCatIconSelect') || el.newCatIconSelect;
    if (!input) return;

    const name = input.value.trim();
    const icon = select ? select.value : 'fa-folder';
    if (!name) {
      alert('請輸入分類名稱');
      return;
    }

    const newCat = {
      id: 'cat-custom-' + Date.now(),
      name,
      icon,
      color: '#6366f1'
    };

    categories.push(newCat);
    saveState(STORAGE_CATS_KEY, categories);
    input.value = '';
    renderCategoryManageList();
    renderSidebarAndPills();
    renderDocuments();
    updateStats();
    showToast(`成功新增分類「${name}」！`);
  }

  // ==========================================================================
  // Family Member Management & Dynamic Renaming
  // ==========================================================================
  function openMemberManageModal() {
    renderMemberManageList();
    const modal = document.getElementById('memberManageModal') || el.memberManageModal;
    if (modal) modal.classList.add('active');
  }

  function renderMemberManageList() {
    const listEl = document.getElementById('memberManageList') || el.memberManageList;
    if (!listEl) return;
    listEl.innerHTML = '';
    members.forEach(mem => {
      const row = document.createElement('div');
      row.className = 'manage-item-row';
      row.innerHTML = `
        <span style="font-size: 20px;">${mem.avatar}</span>
        <input type="text" class="form-control" value="${mem.name}" data-mem-id="${mem.id}">
        <button class="btn btn-secondary btn-sm" data-action="save-name"><i class="fa-solid fa-floppy-disk"></i> 改名</button>
        <button class="btn btn-danger-soft btn-sm" data-action="delete"><i class="fa-solid fa-trash"></i></button>
      `;

      // Save Name
      row.querySelector('[data-action="save-name"]').addEventListener('click', () => {
        const inputVal = row.querySelector('input').value.trim();
        if (inputVal) {
          mem.name = inputVal;
          saveState(STORAGE_MEMBERS_KEY, members);
          renderSidebarAndPills();
          renderDocuments();
          showToast(`成員名稱已更新為「${inputVal}」`);
        }
      });

      // Delete Member
      row.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (members.length <= 1) {
          alert('請至少保留一位家庭成員！');
          return;
        }
        if (confirm(`確定要刪除成員「${mem.name}」嗎？`)) {
          members = members.filter(m => m.id !== mem.id);
          saveState(STORAGE_MEMBERS_KEY, members);
          renderMemberManageList();
          renderSidebarAndPills();
          renderDocuments();
          showToast('成員已刪除', 'fa-trash-can');
        }
      });

      listEl.appendChild(row);
    });
  }

  function handleAddMember() {
    const input = document.getElementById('newMemberNameInput') || el.newMemberNameInput;
    const select = document.getElementById('newMemberAvatarSelect') || el.newMemberAvatarSelect;
    if (!input) return;

    const name = input.value.trim();
    const avatar = select ? select.value : '👨';
    if (!name) {
      alert('請輸入成員稱呼');
      return;
    }

    const newMem = {
      id: 'mem-custom-' + Date.now(),
      name,
      avatar
    };

    members.push(newMem);
    saveState(STORAGE_MEMBERS_KEY, members);
    input.value = '';
    renderMemberManageList();
    renderSidebarAndPills();
    renderDocuments();
    showToast(`成功新增家庭成員「${name}」！`);
  }

  // Kickstart App when DOM Ready
  document.addEventListener('DOMContentLoaded', init);

})();
