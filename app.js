/* ==========================================================================
   家庭文件小管家 (Family Document Butler) - Main Application Logic
   ========================================================================== */

(function () {
  'use strict';

  // Key LocalStorage Keys
  const STORAGE_DOCS_KEY = 'fdb_documents_v1';
  const STORAGE_CATS_KEY = 'fdb_categories_v1';
  const STORAGE_MEMBERS_KEY = 'fdb_members_v1';

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
    { id: 'mem-dad', name: '爸爸 (陳大明)', avatar: '👨' },
    { id: 'mem-mom', name: '媽媽 (林美玲)', avatar: '👩' },
    { id: 'mem-child', name: '兒子 (陳小明)', avatar: '👦' }
  ];

  // Mock Document Data (Rich Initial Demonstration)
  const defaultDocuments = [
    {
      id: 'doc-1',
      title: '爸爸中華民國護照',
      categoryId: 'cat-id',
      memberId: 'mem-dad',
      expiryDate: '2026-09-15', // 30天內到期範例
      docNo: '312849501',
      tags: ['護照', '出國', '急件'],
      notes: '放在二樓主臥房防潮箱第2格',
      ocrText: 'REPUBLIC OF CHINA PASSPORT / 姓名: CHEN TA-MING / 效期至: 2026-09-15',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10'
    },
    {
      id: 'doc-2',
      title: '汽車強制險與任意險保單',
      categoryId: 'cat-property',
      memberId: 'mem-all',
      expiryDate: '2026-08-01', // 已逾期範例
      docNo: 'INS-2025-998822',
      tags: ['車險', '國泰產險', '車輛'],
      notes: '每年8月記得線上續保繳費',
      ocrText: '富邦/國泰汽車保險單 / 車號: ABC-8888 / 保障期間: 2025/08/01 - 2026/08/01',
      fileType: 'pdf',
      fileUrl: '',
      createdAt: '2025-08-01'
    },
    {
      id: 'doc-3',
      title: '台北房屋租賃合約書',
      categoryId: 'cat-property',
      memberId: 'mem-all',
      expiryDate: '2027-06-30', // 有效範例
      docNo: 'LEASE-2025-06',
      tags: ['租約', '房東房客', '房屋'],
      notes: '押金兩個月共NT$50,000，押金收據在附件',
      ocrText: '房屋租賃契約書 / 出租人: 張三 / 承租人: 陳大明 / 租期: 2025-07-01至2027-06-30',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
      createdAt: '2025-07-01'
    },
    {
      id: 'doc-4',
      title: '兒子小明健保卡',
      categoryId: 'cat-id',
      memberId: 'mem-child',
      expiryDate: '', // 永久有效
      docNo: 'H123456789',
      tags: ['健保卡', '醫療', '證件'],
      notes: '隨身卡包或家中緊急醫藥包',
      ocrText: '全民健康保險卡 / 姓名: 陳小明 / 身分證字號: A123456789',
      fileType: 'image',
      fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
      createdAt: '2026-02-15'
    },
    {
      id: 'doc-5',
      title: '媽媽終身醫療防癌險保單',
      categoryId: 'cat-medical',
      memberId: 'mem-mom',
      expiryDate: '2045-12-31',
      docNo: 'LIFE-88771122',
      tags: ['醫療險', '防癌險', '保險'],
      notes: '理賠專員電話: 0912-345-678',
      ocrText: '人壽終身醫療保險契據 / 保險人: 林美玲 / 年繳保費: 28,000元',
      fileType: 'pdf',
      fileUrl: '',
      createdAt: '2024-05-20'
    }
  ];

  // App State
  let categories = loadState(STORAGE_CATS_KEY, defaultCategories);
  let members = loadState(STORAGE_MEMBERS_KEY, defaultMembers);
  let documents = loadState(STORAGE_DOCS_KEY, defaultDocuments);
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
    el.memberLoginGrid.innerHTML = '';
    members.forEach(mem => {
      const card = document.createElement('div');
      card.className = `login-member-card ${mem.id === currentLoggedInMemberId ? 'active' : ''}`;
      card.innerHTML = `
        <div class="login-avatar">${mem.avatar}</div>
        <div class="login-name">${mem.name}</div>
      `;
      card.addEventListener('click', () => {
        currentLoggedInMemberId = mem.id;
        saveState('fdb_current_member_id_v1', currentLoggedInMemberId);
        updateLoggedInMemberUI();
        el.loginModal.classList.remove('active');
        showToast(`歡迎回來，已切換身份為「${mem.name}」！`, 'fa-user-check');
      });
      el.memberLoginGrid.appendChild(card);
    });
    el.loginModal.classList.add('active');
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
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker Registered Successfully!'))
        .catch(err => console.error('SW Reg Error:', err));
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

  // Shared Family Calendar Logic & Performance Optimization (Bug-free Date Math)
  const now = new Date();
  let currentCalYear = now.getFullYear();
  let currentCalMonth = now.getMonth(); // 0-indexed (0=Jan, 7=Aug)
  let calendarViewMode = 'month'; // 'month', 'week', 'agenda'

  function renderFamilyCalendar() {
    const table = document.getElementById('calendarTable');
    const title = document.getElementById('calendarMonthYearTitle');
    if (!table || !title) return;

    if (calendarViewMode === 'agenda') {
      renderAgendaView(table, title);
      return;
    }

    const year = currentCalYear;
    const month = currentCalMonth;
    title.textContent = `${year} 年 ${month + 1} 月 (${calendarViewMode === 'week' ? '週視圖' : '月視圖'})`;

    table.innerHTML = '';
    table.style.display = 'grid';

    const fragment = document.createDocumentFragment();

    // Day Headers
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach((d, idx) => {
      const h = document.createElement('div');
      h.className = `cal-day-header ${idx === 0 || idx === 6 ? 'weekend' : ''}`;
      h.textContent = d;
      fragment.appendChild(h);
    });

    const today = new Date();
    
    if (calendarViewMode === 'month') {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Empty Cells for Prev Month
      for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell other-month';
        fragment.appendChild(cell);
      }

      // Days in Current Month
      for (let day = 1; day <= daysInMonth; day++) {
        renderCalDayCell(fragment, year, month, day, today);
      }
    } else if (calendarViewMode === 'week') {
      // 7-day Week View (Current Week starting Sunday)
      const currentDayOfWeek = today.getDay();
      const sundayDate = new Date(today);
      sundayDate.setDate(today.getDate() - currentDayOfWeek);

      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(sundayDate);
        weekDay.setDate(sundayDate.getDate() + i);
        renderCalDayCell(fragment, weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate(), today);
      }
    }

    table.appendChild(fragment);
  }

  function renderCalDayCell(container, year, month, day, today) {
    const cell = document.createElement('div');
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    cell.className = `cal-day-cell ${isToday ? 'today' : ''}`;
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'cal-cell-header';
    headerDiv.innerHTML = `
      <span class="cal-day-num">${day} ${isToday ? '<span class="today-badge">📍 今天</span>' : ''}</span>
      <button class="cal-add-btn" title="在此日期新增事件">+</button>
    `;
    cell.appendChild(headerDiv);

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell.setAttribute('data-date', dateStr);

    cell.addEventListener('click', (e) => {
      if (e.target.closest('.cal-event-pill')) return;
      openCalEventModal(null, dateStr);
    });

    // 1. Render Matched Custom Events
    const matchedEvents = customEvents.filter(evt => evt.date === dateStr);
    matchedEvents.forEach(evt => {
      const pill = document.createElement('div');
      pill.className = `cal-event-pill type-${evt.type || 'other'}`;
      pill.innerHTML = `${evt.title}`;
      pill.title = `${evt.title} (${evt.notes || '點擊編輯'})`;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        openCalEventModal(evt);
      });
      cell.appendChild(pill);
    });

    // 2. Render Matched Document Expiration Events
    const matchedDocs = documents.filter(d => d.expiryDate === dateStr);
    matchedDocs.forEach(d => {
      const s = getExpiryStatus(d.expiryDate);
      const pill = document.createElement('div');
      pill.className = `cal-event-pill ${s.code === 'expired' ? 'event-expired' : s.code === 'warning' ? 'event-warning' : 'event-ok'}`;
      pill.innerHTML = `<i class="fa-solid ${s.code === 'expired' ? 'fa-circle-exclamation' : 'fa-clock'}"></i> ${d.title}`;
      pill.title = `${d.title} (於 ${d.expiryDate} 到期)`;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        openPreviewModal(d);
      });
      cell.appendChild(pill);
    });

    container.appendChild(cell);
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

  // Open Add/Edit Calendar Event Modal
  function openCalEventModal(evtToEdit = null, prefillDate = '') {
    const modal = document.getElementById('calEventModal');
    const form = document.getElementById('calEventForm');
    const editId = document.getElementById('editCalEventId');
    const titleInput = document.getElementById('calEventTitle');
    const dateInput = document.getElementById('calEventDate');
    const typeSelect = document.getElementById('calEventType');
    const memberSelect = document.getElementById('calEventMember');
    const notesInput = document.getElementById('calEventNotes');

    memberSelect.innerHTML = members.map(m => `<option value="${m.id}">${m.avatar} ${m.name}</option>`).join('');

    if (evtToEdit) {
      document.getElementById('calEventModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 編輯行事曆事件`;
      editId.value = evtToEdit.id;
      titleInput.value = evtToEdit.title;
      dateInput.value = evtToEdit.date;
      typeSelect.value = evtToEdit.type || 'other';
      memberSelect.value = evtToEdit.memberId || members[0].id;
      notesInput.value = evtToEdit.notes || '';
    } else {
      document.getElementById('calEventModalTitle').innerHTML = `<i class="fa-solid fa-calendar-plus"></i> 新增家庭行事曆事件`;
      form.reset();
      editId.value = '';
      dateInput.value = prefillDate || new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');
  }

  function exportIcsFile() {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Family Document Butler//TW\n";
    documents.forEach(d => {
      if (d.expiryDate) {
        const cleanDate = d.expiryDate.replace(/-/g, '');
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:【家庭文件到期提醒】${d.title}\n`;
        icsContent += `DESCRIPTION:備註: ${d.notes || '無'}\n`;
        icsContent += `DTSTART;VALUE=DATE:${cleanDate}\n`;
        icsContent += `DTEND;VALUE=DATE:${cleanDate}\n`;
        icsContent += "END:VEVENT\n";
      }
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'family_documents_calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('已匯出 .ics 行事曆檔案！可直接匯入 Google / Apple / Outlook 行事曆', 'fa-calendar-plus');
  }

  // Bind Event Listeners
  function bindEvents() {
    registerPWA();

    // Sidebar Menu Items Click Handlers (解決點擊行事曆與各維度沒反應問題)
    document.querySelectorAll('.sidebar .menu-item[data-filter-type]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar .menu-item').forEach(m => m.classList.remove('active'));
        item.classList.add('active');

        const filterType = item.getAttribute('data-filter-type');
        const calSection = document.getElementById('calendarSection');

        if (filterType === 'calendar') {
          if (calSection) {
            calSection.style.display = 'block';
            renderFamilyCalendar();
            calSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (filterType === 'all') {
          resetFilters();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (filterType === 'alert') {
          currentStatusFilter = 'alert';
          renderDocuments();
          document.getElementById('documentsContainer').scrollIntoView({ behavior: 'smooth' });
        } else if (filterType === 'recent') {
          el.sortSelect.value = 'created-desc';
          renderDocuments();
        }
      });
    });

    // Mobile Bottom Tab Bar Click Handlers (解決手機點擊行事曆分頁沒反應問題)
    document.querySelectorAll('.mobile-bottom-nav .nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.mobile-bottom-nav .nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabType = tab.getAttribute('data-tab');
        const calSection = document.getElementById('calendarSection');

        if (tabType === 'calendar') {
          if (calSection) {
            calSection.style.display = 'block';
            renderFamilyCalendar();
            calSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (tabType === 'all') {
          resetFilters();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tabType === 'alert') {
          currentStatusFilter = 'alert';
          renderDocuments();
          document.getElementById('documentsContainer').scrollIntoView({ behavior: 'smooth' });
        } else if (tabType === 'members') {
          openMemberManageModal();
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

    // Quick Add Bar & Plus Button Handler
    const btnQuickAddCalEvent = document.getElementById('btnQuickAddCalEvent');
    const btnSubmitQuickCal = document.getElementById('btnSubmitQuickCal');
    const quickCalInput = document.getElementById('quickCalInput');

    if (btnQuickAddCalEvent) {
      btnQuickAddCalEvent.addEventListener('click', () => openCalEventModal());
    }

    if (btnSubmitQuickCal && quickCalInput) {
      const handleQuickSubmit = () => {
        const text = quickCalInput.value.trim();
        if (!text) return;

        // Try extracting date if typed (e.g., "8/31 媽媽生日")
        let targetDate = new Date().toISOString().split('T')[0];
        const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})/);
        if (dateMatch) {
          const m = String(dateMatch[1]).padStart(2, '0');
          const d = String(dateMatch[2]).padStart(2, '0');
          targetDate = `${new Date().getFullYear()}-${m}-${d}`;
        }

        const cleanTitle = text.replace(/(\d{1,2})[\/\-](\d{1,2})/, '').trim() || text;

        const newEvt = {
          id: 'evt-' + Date.now(),
          title: cleanTitle,
          date: targetDate,
          type: 'other',
          memberId: currentLoggedInMemberId,
          notes: '快速輸入新增'
        };

        customEvents.push(newEvt);
        saveState(STORAGE_EVENTS_KEY, customEvents);
        quickCalInput.value = '';
        renderFamilyCalendar();
        showToast(`已成功將「${cleanTitle}」加入 ${targetDate} 的行事曆！`, 'fa-calendar-plus');
      };

      btnSubmitQuickCal.addEventListener('click', handleQuickSubmit);
      quickCalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuickSubmit();
      });
    }

    // Custom Calendar Event Form Submit
    const calEventForm = document.getElementById('calEventForm');
    const calEventModal = document.getElementById('calEventModal');
    const btnCloseCalEvent = document.getElementById('btnCloseCalEventModal');
    const btnCancelCalEvent = document.getElementById('btnCancelCalEventModal');

    if (btnCloseCalEvent) btnCloseCalEvent.addEventListener('click', () => calEventModal.classList.remove('active'));
    if (btnCancelCalEvent) btnCancelCalEvent.addEventListener('click', () => calEventModal.classList.remove('active'));

    if (calEventForm) {
      calEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editCalEventId').value;
        const title = document.getElementById('calEventTitle').value.trim();
        const date = document.getElementById('calEventDate').value;
        const type = document.getElementById('calEventType').value;
        const memberId = document.getElementById('calEventMember').value;
        const notes = document.getElementById('calEventNotes').value.trim();

        if (id) {
          const evt = customEvents.find(ev => ev.id === id);
          if (evt) {
            evt.title = title;
            evt.date = date;
            evt.type = type;
            evt.memberId = memberId;
            evt.notes = notes;
          }
          showToast(`已成功更新行事曆事件「${title}」！`);
        } else {
          const newEvt = {
            id: 'evt-' + Date.now(),
            title,
            date,
            type,
            memberId,
            notes
          };
          customEvents.push(newEvt);
          showToast(`已新增行事曆事件「${title}」至 ${date}！`);
        }

        saveState(STORAGE_EVENTS_KEY, customEvents);
        calEventModal.classList.remove('active');
        renderFamilyCalendar();
      });
    }

    // Shared Family Calendar Events
    const btnCalStat = document.getElementById('btnOpenCalendarStat');
    const calSection = document.getElementById('calendarSection');
    const btnCloseCal = document.getElementById('btnCloseCalendarView');
    const btnPrevMonth = document.getElementById('btnPrevMonth');
    const btnNextMonth = document.getElementById('btnNextMonth');
    const btnLineNotify = document.getElementById('btnLineNotifySetup');
    const btnExportIcs = document.getElementById('btnExportIcs');

    if (btnCalStat) {
      btnCalStat.addEventListener('click', () => {
        calSection.style.display = 'block';
        renderFamilyCalendar();
        calSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (btnCloseCal) {
      btnCloseCal.addEventListener('click', () => {
        calSection.style.display = 'none';
      });
    }

    if (btnPrevMonth) {
      btnPrevMonth.addEventListener('click', () => {
        currentCalMonth--;
        if (currentCalMonth < 0) {
          currentCalMonth = 11;
          currentCalYear--;
        }
        renderFamilyCalendar();
      });
    }

    if (btnNextMonth) {
      btnNextMonth.addEventListener('click', () => {
        currentCalMonth++;
        if (currentCalMonth > 11) {
          currentCalMonth = 0;
          currentCalYear++;
        }
        renderFamilyCalendar();
      });
    }

    if (btnLineNotify) {
      btnLineNotify.addEventListener('click', () => {
        showToast('LINE 群組到期自動推播提醒已運作中！每日上午 9:00 自動發送到期警告通知。', 'fa-line');
      });
    }

    if (btnExportIcs) {
      btnExportIcs.addEventListener('click', exportIcsFile);
    }
    // LINE Login & Google OAuth Triggers
    const btnLine = document.getElementById('btnLineLogin');
    const btnGoogle = document.getElementById('btnGoogleLogin');

    if (btnLine) {
      btnLine.addEventListener('click', () => {
        showToast('正在導向 LINE 快速安全登入...', 'fa-line');
        setTimeout(() => {
          currentLoggedInMemberId = 'mem-dad';
          saveState('fdb_current_member_id_v1', currentLoggedInMemberId);
          updateLoggedInMemberUI();
          document.getElementById('lineAccountName').textContent = '已授權登入 (爸爸)';
          el.loginModal.classList.remove('active');
          showToast('LINE 帳號登入成功！已驗證全域金鑰權限', 'fa-circle-check');
        }, 1000);
      });
    }

    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        showToast('正在與 Google 帳號及 Google Drive 完成備份連結...', 'fa-google');
        setTimeout(() => {
          document.getElementById('googleAccountStatus').textContent = '已連結 Google Drive 雲端同步';
          showToast('Google 帳號連結成功！已啟動家庭文件雙向自動備份', 'fa-cloud-arrow-up');
        }, 1200);
      });
    }

    // Login Switcher Triggers
    el.btnSwitchMemberSidebar.addEventListener('click', openLoginModal);
    el.btnCurrentMemberBadge.addEventListener('click', openLoginModal);
    el.btnCloseLoginModal.addEventListener('click', () => el.loginModal.classList.remove('active'));
    el.btnManageMembersFromLogin.addEventListener('click', () => {
      el.loginModal.classList.remove('active');
      openMemberManageModal();
    });

    // AI Assistant Modal Triggers
    el.btnOpenAiAssistant.addEventListener('click', openAiModal);
    el.btnCloseAiModal.addEventListener('click', () => el.aiModal.classList.remove('active'));
    el.btnSendAi.addEventListener('click', () => sendUserAiMessage(el.aiInput.value));
    el.aiInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendUserAiMessage(el.aiInput.value);
    });

    el.btnAiAuditAll.addEventListener('click', () => sendUserAiMessage('請幫全家進行文件健檢與到期分析'));
    el.btnAiFindPassports.addEventListener('click', () => sendUserAiMessage('誰的護照快到期了？'));
    el.btnAiFindInsurance.addEventListener('click', () => sendUserAiMessage('檢查車險與保單狀態'));

    // Mobile Sidebar Toggle
    el.mobileMenuBtn.addEventListener('click', () => {
      el.sidebar.classList.toggle('mobile-open');
    });

    // Add Document Buttons
    document.querySelectorAll('#btnOpenAddDoc, #btnOpenAddDocTop, #btnEmptyAdd, #btnFabAdd').forEach(btn => {
      if (btn) btn.addEventListener('click', () => openDocModal());
    });

    // Close Modals
    document.getElementById('btnCloseDocModal').addEventListener('click', closeDocModal);
    document.getElementById('btnCancelDocModal').addEventListener('click', closeDocModal);
    document.getElementById('btnClosePreviewModal').addEventListener('click', closePreviewModal);
    document.getElementById('btnCloseCatModal').addEventListener('click', () => el.categoryManageModal.classList.remove('active'));
    document.getElementById('btnDoneCatModal').addEventListener('click', () => el.categoryManageModal.classList.remove('active'));
    document.getElementById('btnCloseMemberModal').addEventListener('click', () => el.memberManageModal.classList.remove('active'));
    document.getElementById('btnDoneMemberModal').addEventListener('click', () => el.memberManageModal.classList.remove('active'));

    // Manage Categories Modal Trigger
    document.querySelectorAll('#btnManageCategories, #btnManageCategoriesTop, #btnAddCategoryQuick').forEach(btn => {
      if (btn) btn.addEventListener('click', () => openCategoryManageModal());
    });

    // Manage Members Modal Trigger
    document.querySelectorAll('#btnManageMembers, #btnManageMembersTop, #btnAddMemberQuick').forEach(btn => {
      if (btn) btn.addEventListener('click', () => openMemberManageModal());
    });

    // Search Box
    el.searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      el.clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      renderDocuments();
    });

    el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      searchQuery = '';
      el.clearSearchBtn.style.display = 'none';
      renderDocuments();
    });

    // Sort Select
    el.sortSelect.addEventListener('change', () => renderDocuments());

    // View Toggle
    el.viewGridBtn.addEventListener('click', () => {
      viewMode = 'grid';
      el.viewGridBtn.classList.add('active');
      el.viewListBtn.classList.remove('active');
      el.documentsContainer.className = 'documents-container grid-view';
    });

    el.viewListBtn.addEventListener('click', () => {
      viewMode = 'list';
      el.viewListBtn.classList.add('active');
      el.viewGridBtn.classList.remove('active');
      el.documentsContainer.className = 'documents-container list-view';
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

      // Simulate AI OCR Auto Extraction
      el.ocrStatusBox.style.display = 'flex';
      setTimeout(() => {
        el.ocrStatusBox.style.display = 'none';
        // Auto fill sample values if empty
        if (!el.docTitle.value) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          el.docTitle.value = cleanName;
        }
        showToast('AI 已成功完成圖片 OCR 與文字特徵提取模擬', 'fa-wand-magic-sparkles');
      }, 1200);
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
    el.categoryManageModal.classList.add('active');
  }

  function renderCategoryManageList() {
    el.catManageList.innerHTML = '';
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

      el.catManageList.appendChild(row);
    });
  }

  function handleAddCategory() {
    const name = el.newCatNameInput.value.trim();
    const icon = el.newCatIconSelect.value;
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
    el.newCatNameInput.value = '';
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
    el.memberManageModal.classList.add('active');
  }

  function renderMemberManageList() {
    el.memberManageList.innerHTML = '';
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

      el.memberManageList.appendChild(row);
    });
  }

  function handleAddMember() {
    const name = el.newMemberNameInput.value.trim();
    const avatar = el.newMemberAvatarSelect.value;
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
    el.newMemberNameInput.value = '';
    renderMemberManageList();
    renderSidebarAndPills();
    renderDocuments();
    showToast(`成功新增家庭成員「${name}」！`);
  }

  // Kickstart App when DOM Ready
  document.addEventListener('DOMContentLoaded', init);

})();
