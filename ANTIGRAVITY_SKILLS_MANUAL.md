# 📘 Antigravity Awesome Skills 終極使用手冊
*Antigravity AI Agent 專業技能庫全書*

---

## 📖 目錄 (Table of Contents)

1. [前言與簡介](#-1-前言與簡介)
2. [系統架構與安裝目錄](#-2-系統架構與安裝目錄)
3. [使用方式與觸發機制](#-3-使用方式與觸發機制)
4. [核心技能目錄與分類對照表](#-4-核心技能目錄與分類對照表)
   - [4.1 軟體工程與程式碼品質 (Engineering & Quality)](#41-軟體工程與程式碼品質-engineering--quality)
   - [4.2 資安稽核與防禦加固 (Cybersecurity & Audit)](#42-資安稽核與防禦加固-cybersecurity--audit)
   - [4.3 架構設計與 API 規範 (Architecture & API)](#43-架構設計與-api-規範-architecture--api)
   - [4.4 前端 UI/UX 與互動設計 (UI/UX & Frontend)](#44-前端-uiux-與互動設計-uiux--frontend)
   - [4.5 產品管理與敏捷規劃 (Product & Agile)](#45-產品管理與敏捷規劃-product--agile)
   - [4.6 DevOps 與雲端基礎設施 (DevOps & Cloud)](#46-devops-與雲端基礎設施-devops--cloud)
5. [實戰 Prompt 對話模板](#-5-實戰-prompt-對話模板)
6. [如何撰寫自訂私房 Skill (Custom Skills Guide)](#-6-如何撰寫自訂私房-skill-custom-skills-guide)
7. [維護與更新指南 (Maintenance & Updates)](#-7-維護與更新指南-maintenance--updates)

---

## 📖 1. 前言與簡介

**Antigravity Awesome Skills** 是一套專為 Agentic AI 打造的擴充技能庫。透過將行業最佳實踐、架構模式與資安審查 SOP 模組化，讓 AI Assistant 在執行複雜工程任務時，身體力行地遵循專業標準輸出，不再僅依靠基礎對話能力。

---

## ⚙️ 2. 系統架構與安裝目錄

技能庫分為 **全域 (Global)** 與 **專案區域 (Workspace-local)** 兩種加載層級：

```
📁 系統層級目錄結構
├── 🌐 全域配置目錄 (Global): C:\Users\austi\.gemini\config\skills\
└── 🏠 專案區域目錄 (Local):  <Your-Project-Root>\.agents\skills\
```

### Skill 內部結構拆解
每一個 Skill 皆為獨立資料夾，其標準結構如下：

```
📁 skill-name/
├── 📄 SKILL.md             # 核心指令檔 (包含 YAML Frontmatter 描述與 SOP)
├── 📁 scripts/             # (可選) 輔助執行腳本 (Python / Bash 等)
├── 📁 examples/            # (可選) 參考範例檔或程式碼片段
└── 📁 references/          # (可選) 補充技術文件與規範
```

---

## 🚀 3. 使用方式與觸發機制

Antigravity 支援以下三種 Skill 調用方式：

### 💡 方式 A：自然意圖自動觸發 (Recommended)
不需要記住複雜命令。當您的需求與 Skill 描述符合時，Agent 會自動搜尋並啟動對應 Skill。
> **範例**：「幫我對這段結帳邏輯寫單元測試，請先寫測試再寫功能。」  
> *(Agent 自動啟動 `tdd` Skill)*

### 💡 方式 B：明確名稱調用
在提示詞中明確提及 Skill 名稱，強制指定 Agent 使用特定的處理規範。
> **範例**：「請使用 **clean-architecture** 技能重構整個 Authentication 模組。」

### 💡 方式 C：多 Skill 組合工作流 (Multi-Skill Pipeline)
串聯多個不同領域的 Skill，實現高複雜度的複合任務。
> **範例**：「請先調用 **prd-writing** 規劃產品規格，再用 **system-design** 設計架構，最後使用 **owasp-audit** 檢視資安風險。」

---

## 📑 4. 核心技能目錄與分類對照表

### 4.1 軟體工程與程式碼品質 (Engineering & Quality)

| Skill 名稱 | 功能描述 | 最佳應用場景 |
| :--- | :--- | :--- |
| **`tdd`** | 實施 Red-Green-Refactor 測試驅動開發流程 | 開發關鍵商業邏輯、演算法或核心算式時 |
| **`clean-architecture`** | 嚴格劃分 Domain, Use Cases, Controller 層級 | 建立長期維護的中大型專案架構時 |
| **`code-review`** | 針對邏輯漏洞、邊界條件與可讀性進行審查 | 發起 PR 前或合併主幹前的驗收階段 |
| **`refactoring`** | 消除 Code Smells，提高模組化程度與重複利用率 | 處理 Legacy Code 或龐大單體檔案時 |
| **`unit-testing`** | 撰寫覆蓋率高且具備 Mock/Stub 的單元測試 | 補齊既有專案的 Test Coverage 時 |

---

### 4.2 資安稽核與防禦加固 (Cybersecurity & Audit)

| Skill 名稱 | 功能描述 | 最佳應用場景 |
| :--- | :--- | :--- |
| **`owasp-audit`** | 檢查 SQLi, XSS, CSRF, IDOR 等 OWASP Top 10 漏洞 | Web 應用上線前或資安合規檢查時 |
| **`security-hardening`** | 針對伺服器、環境變數、Docker 與標頭進行加固 | 設定生產環境 (Production Environment) 時 |
| **`penetration-test`** | 規劃與模擬系統滲透測試攻擊路徑 | 進行內部安全性演練與漏洞排查時 |
| **`secret-scanner`** | 掃描代碼中是否誤植 API Key, 密碼或私鑰 | Commit 或 Push 程式碼至 Git 前 |

---

### 4.3 架構設計與 API 規範 (Architecture & API)

| Skill 名稱 | 功能描述 | 最佳應用場景 |
| :--- | :--- | :--- |
| **`system-design`** | 設計高併發、高可用、分散式系統架構 | 評估系統容量、快取策略與資料庫選型時 |
| **`api-first-design`** | 撰寫標準化 OpenAPI 3.0 / Swagger 規格書 | 前後端分離專案開發初期 |
| **`microservices`** | 規劃微服務劃分、gRPC 通訊與 Event Bus 模式 | 拆分大型單體 (Monolith) 系統時 |
| **`database-design`** | 資料庫 Schema 設計、正則化與索引優化 | 設計資料庫表欄位與外鍵關聯時 |

---

### 4.4 前端 UI/UX 與互動設計 (UI/UX & Frontend)

| Skill 名稱 | 功能描述 | 最佳應用場景 |
| :--- | :--- | :--- |
| **`modern-ui-design`** | 打造極具現代感、暗黑模式、流暢動畫的 Web 介面 | 建立 Web 應用、Dashboard 或 Landing Page 時 |
| **`accessibility-a11y`** | 符合 WCAG 2.1 AA 標準與 ARIA 鍵盤導航規範 | 開發公家機關或高無障礙要求之產品時 |
| **`performance-opt`** | 優化前端載入速度、Core Web Vitals 與資源打包 | 改善頁面載入緩慢或 Lighthouse 分數過低時 |

---

### 4.5 產品管理與敏捷規劃 (Product & Agile)

| Skill 名稱 | 功能描述 | 最佳應用場景 |
| :--- | :--- | :--- |
| **`prd-writing`** | 產出結構嚴謹的 PRD，含 Acceptance Criteria | 需求發想完畢，準備交由工程團隊開發前 |
| **`user-story-mapping`** | 拆解 User Stories，規劃 Sprint 優先順序 | 敏捷 Sprint Planning 與需求估時階段 |

---

### 4.6 DevOps 與雲端基礎設施 (DevOps & Cloud)

| Skill 名稱 | 功能描述 | 最佳應用場景 |
| :--- | :--- | :--- |
| **`docker-expert`** | 撰寫多階段編譯 (Multi-stage Build) 極小化映像檔 | 建立容器化環境與 CI/CD 部署流程時 |
| **`ci-cd-pipeline`** | 建立 GitHub Actions 或 GitLab CI 自動化流程 | 實作自動化測試、Build 與自動部署時 |

---

## 💬 5. 實戰 Prompt 對話模板

您可以直接複製以下模板並修改括號中的內容使用：

### 🎯 模板一：全新功能開發 (TDD + Clean Architecture)
```text
我想為專案新增【功能名稱，例如：會員訂閱與自動扣款】。
請執行以下步驟：
1. 調用 prd-writing 幫我列出需求細節與 Acceptance Criteria。
2. 使用 clean-architecture 設計分層架構與 Domain Entities。
3. 採用 tdd 模式，先產出單元測試案例，再撰寫實際邏輯。
```

### 🎯 模板二：資安與效能全面體檢
```text
請對【專案名稱或資料夾路徑】進行全面體檢：
1. 使用 owasp-audit 檢視是否有任何資安漏洞或敏感資訊洩露。
2. 使用 performance-opt 分析程式碼瓶頸並提供具體的優化方案。
```

---

## 🛠️ 6. 如何撰寫自訂私房 Skill (Custom Skills Guide)

若您有團隊內部的專屬規範，可在 `C:\Users\austi\.gemini\config\skills` 下新建一個資料夾：

### 步驟 1：建立目錄結構
```powershell
mkdir "C:\Users\austi\.gemini\config\skills\my-team-style"
```

### 步驟 2：撰寫 `SKILL.md`
建立 `C:\Users\austi\.gemini\config\skills\my-team-style\SKILL.md`，填入以下內容：

```markdown
---
name: my-team-style
description: 當使用者要求符合團隊程式碼風格或進行專案初始化時啟用此技能。
---

# 團隊程式碼風格指南

當執行程式碼生成時，必須遵循以下規則：
1. 所有的函數必須明確宣告 TypeScript 型別。
2. 使用 2 個空格縮排。
3. 錯誤處理必須使用 Custom AppError 類別。
```

建立完成後，Antigravity 會自動掃描並載入您的私房 Skill！

---

## 🔄 7. 維護與更新指南 (Maintenance & Updates)

由於 `antigravity-awesome-skills` 是以 Git 儲存庫的形式安裝，您可以隨時取得社群最新的 Skill 更新：

### 手動更新指令
開啟 PowerShell 或 CMD 終端機，執行以下指令：

```powershell
git -C "C:\Users\austi\.gemini\config\skills" pull
```

若出現衝突或想重新乾淨安裝，可以先移除該資料夾再重新複製：

```powershell
Remove-Item -Recurse -Force "C:\Users\austi\.gemini\config\skills"
git clone https://github.com/sickn33/antigravity-awesome-skills.git "C:\Users\austi\.gemini\config\skills"
```

---

*本手冊由 Antigravity AI 自動生成並維護。您可以隨時查閱本檔以獲取最佳開發體驗！*
