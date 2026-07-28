// 获取当前登录用户
function getCurrentUser() {
    // 从localStorage获取登录用户（实际项目中应该从登录系统获取）
    const currentUser = localStorage.getItem('currentUser') || '管理员';
    return currentUser;
}

// 设置当前登录用户显示
function setCurrentUserDisplay() {
    const currentUser = getCurrentUser();
    const userElement = document.getElementById('current-user');
    if (userElement) {
        userElement.textContent = currentUser;
    }
}

// 页面切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化当前用户显示
    setCurrentUserDisplay();
    
    // 初始化用户下拉菜单
    initUserDropdown();
    
    const navItems = document.querySelectorAll('.nav-item');
    const pageContents = document.querySelectorAll('.page-content');
    const pageTitle = document.getElementById('page-title');
    
    const pageTitles = {
        'package': '套餐管理',
        'exam-project': '体检项目管理',
        'patient': '患者管理',
        'examination': '体检台',
        'appointment': '预约管理',
        'report': '体检报告管理'
    };

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            // 移除所有活动状态
            navItems.forEach(nav => nav.classList.remove('active'));
            pageContents.forEach(page => page.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(targetPage + '-page').classList.add('active');
            pageTitle.textContent = pageTitles[targetPage];
            
            // 如果切换到患者管理页面，重新加载表格
            if (targetPage === 'patient') {
                loadPatientTable();
            }
            if (targetPage === 'package') {
                handleEnterPackagePage();
            }
        });
    });
    
    // 初始化报告管理页面
    initializeReportPage();
    
    // 初始化套餐管理筛选
    initializePackagePage();
    handleEnterPackagePage();

    // 初始化体检项目管理页面
    initializeExamProjectPage();
    
    // 初始化体检台筛选
    initializeExaminationPage();
    
    // 初始化预约管理列表筛选
    initializeAppointmentListPage();
    
    // 初始化身份证号输入监听（用于新增患者表单和编辑表单）
    // 使用事件委托，因为模态框可能在页面加载时还未渲染
    document.addEventListener('blur', function(e) {
        // 新增患者表单
        if (e.target && e.target.id === 'patient-id-number') {
            const idNumber = e.target.value.trim();
            const idType = document.getElementById('id-type-select').value;
            const birthdateInput = document.getElementById('patient-birthdate');
            const ageInput = document.getElementById('patient-age');
            
            // 只有身份证类型且输入了身份证号时才提取
            if (idType === '身份证' && idNumber) {
                const birthdate = extractBirthdateFromId(idNumber);
                if (birthdate) {
                    if (birthdateInput) birthdateInput.value = birthdate;
                    const age = calculateAgeFromBirthdate(birthdate);
                    if (age !== null && age >= 0 && ageInput) {
                        ageInput.value = age;
                    }
                }
            }
        }
        
        // 编辑患者表单
        if (e.target && e.target.id === 'edit-id-number') {
            const idNumber = e.target.value.trim();
            const idType = document.getElementById('edit-id-type').value;
            const birthdateInput = document.getElementById('edit-birthdate');
            const ageInput = document.getElementById('edit-age');
            
            // 只有身份证类型且输入了身份证号时才提取
            if (idType === '身份证' && idNumber) {
                const birthdate = extractBirthdateFromId(idNumber);
                if (birthdate) {
                    if (birthdateInput) birthdateInput.value = birthdate;
                    const age = calculateAgeFromBirthdate(birthdate);
                    if (age !== null && age >= 0 && ageInput) {
                        ageInput.value = age;
                    }
                }
            }
        }
    }, true);
});

// 体检项目管理模拟数据
const examProjectData = [
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[ALT]谷丙转氨酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '5 ~ 44', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[AST]谷草转氨酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '5 ~ 47', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[GGT]谷氨酰转移酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '7 ~ 52', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[ALP]碱性磷酸酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '29 ~ 143', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[TBIL]总胆红素', inputType: '填写', dataType: '数字', unit: 'umol/L', options: '-', reference: '3.10 ~ 17.50', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[DBIL]直接胆红素', inputType: '填写', dataType: '数字', unit: 'umol/L', options: '-', reference: '0.00 ~ 7.50', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[TP]总蛋白', inputType: '填写', dataType: '数字', unit: 'g/L', options: '-', reference: '59 ~ 85', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[ALB]白蛋白', inputType: '填写', dataType: '数字', unit: 'g/L', options: '-', reference: '40 ~ 55', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肝功九项', subItem: '[CHE]胆碱酯酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '4751 ~ 12226', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肾功三项', subItem: '[Urea]尿素', inputType: '填写', dataType: '数字', unit: 'mmol/L', options: '-', reference: '2.80 ~ 9.00', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肾功三项', subItem: '[Crea-E]肌酐', inputType: '填写', dataType: '数字', unit: 'umol/L', options: '-', reference: '39 ~ 79', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '肾功三项', subItem: '[UA]尿酸', inputType: '填写', dataType: '数字', unit: 'umol/L', options: '-', reference: '155 ~ 358', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '血脂四项', subItem: '[CHO]总胆固醇', inputType: '填写', dataType: '数字', unit: 'mmol/L', options: '-', reference: '2.76-5.64', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '血脂四项', subItem: '[TG]甘油三酯', inputType: '填写', dataType: '数字', unit: 'mmol/L', options: '-', reference: '0-1.7', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '血脂四项', subItem: '[HDL-C]低密度脂蛋白', inputType: '填写', dataType: '数字', unit: 'mmol/L', options: '-', reference: '1.00-1.56', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '血脂四项', subItem: '[LDL-C]高密度脂蛋白', inputType: '填写', dataType: '数字', unit: 'mmol/L', options: '-', reference: '0.50-3.42', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '心肌酶四项', subItem: '[CK]肌酸激酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '24 ~ 174', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '心肌酶四项', subItem: '[CK-MB]肌酸激酶同工酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '0 ~ 24', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '心肌酶四项', subItem: '[LDH]乳酸脱氢酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '124 ~ 243', remark: '-' },
    { department: '实验室检查', category: '生化检查', item: '心肌酶四项', subItem: '[HBDH]羟丁酸脱氢酶', inputType: '填写', dataType: '数字', unit: 'U/L', options: '-', reference: '69 ~ 191', remark: '-' },
    { department: '一般检查', category: '基础体征', item: '身高体重', subItem: '身高', inputType: '填写', dataType: '数字', unit: 'cm', options: '-', reference: '按年龄/性别评估', remark: '用于BMI计算' },
    { department: '一般检查', category: '基础体征', item: '身高体重', subItem: '体重', inputType: '填写', dataType: '数字', unit: 'kg', options: '-', reference: '按年龄/性别评估', remark: '用于BMI计算' },
    { department: '一般检查', category: '基础体征', item: '血压', subItem: '收缩压', inputType: '填写', dataType: '数字', unit: 'mmHg', options: '-', reference: '90 ~ 139', remark: '-' },
    { department: '一般检查', category: '基础体征', item: '血压', subItem: '舒张压', inputType: '填写', dataType: '数字', unit: 'mmHg', options: '-', reference: '60 ~ 89', remark: '-' },
    { department: '物理检查', category: '内科检查', item: '心肺听诊', subItem: '心率', inputType: '填写', dataType: '数字', unit: 'bpm', options: '-', reference: '60 ~ 100', remark: '-' },
    { department: '物理检查', category: '内科检查', item: '心肺听诊', subItem: '心律', inputType: '下拉', dataType: '枚举', unit: '-', options: '齐/不齐/绝对不齐', reference: '齐', remark: '-' },
    { department: '物理检查', category: '外科检查', item: '甲状腺', subItem: '甲状腺触诊', inputType: '下拉', dataType: '枚举', unit: '-', options: '未见异常/肿大/结节/压痛', reference: '未见异常', remark: '-' },
    { department: '心电图', category: '心电图检查', item: '十二导联心电图', subItem: '心电图结论', inputType: '填写', dataType: '文本', unit: '-', options: '-', reference: '窦性心律，未见明显异常', remark: '可由AI解析后回填' },
    { department: '超声检查', category: '腹部超声', item: '肝胆胰脾肾彩超', subItem: '超声所见', inputType: '填写', dataType: '文本', unit: '-', options: '-', reference: '未见明显异常', remark: '支持图文报告' },
    { department: '影像检查', category: '放射检查', item: '胸部正位片', subItem: '影像诊断', inputType: '填写', dataType: '文本', unit: '-', options: '-', reference: '心肺膈未见明显异常', remark: '-' },
    { department: '内镜检查', category: '胃肠镜检查', item: '碳13呼气试验', subItem: '幽门螺杆菌', inputType: '下拉', dataType: '枚举', unit: '-', options: '阴性/阳性', reference: '阴性', remark: '-' }
];

let currentExamProjectDepartment = '';
let currentExamProjectItem = '';
let examProjectDepartments = [];
let examProjectDepartmentRemarks = {};
const examCategoryOptions = ['常规检查', '物理检查', '一般检查'];

function getExamProjectDepartments() {
    examProjectData.forEach(function (row) {
        if (examProjectDepartments.indexOf(row.department) === -1) {
            examProjectDepartments.push(row.department);
        }
    });
    return examProjectDepartments.slice();
}

function getExamProjectDepartmentsFromRows() {
    const departments = [];
    examProjectData.forEach(function (row) {
        if (departments.indexOf(row.department) === -1) {
            departments.push(row.department);
        }
    });
    return departments;
}

function getExamProjectRowsByDepartment(department) {
    return examProjectData.filter(function (row) {
        return row.department === department;
    });
}

function getUniqueValues(rows, key) {
    const values = [];
    rows.forEach(function (row) {
        if (values.indexOf(row[key]) === -1) {
            values.push(row[key]);
        }
    });
    return values;
}

function normalizeExamProjectStatuses() {
    examProjectData.forEach(function (row) {
        if (!row.status) {
            row.status = '启用';
        }
    });
}

function initializeExamProjectPage() {
    const page = document.getElementById('exam-project-page');
    if (!page) return;

    const departmentSearch = document.getElementById('exam-project-department-search');
    const categoryFilter = document.getElementById('exam-project-category-filter');
    const dataFilter = document.getElementById('exam-project-data-filter');
    const searchInput = document.getElementById('exam-project-search');
    const departmentForm = document.getElementById('exam-department-form');
    const itemForm = document.getElementById('exam-item-form');
    const inputTypeCheckboxes = document.querySelectorAll('.exam-input-type-checkbox');

    normalizeExamProjectStatuses();
    renderExamProjectDepartments();
    const departments = getExamProjectDepartments();
    if (departments.length > 0) {
        setExamProjectDepartment(departments[0]);
    }

    if (departmentSearch) {
        departmentSearch.addEventListener('input', function () {
            renderExamProjectDepartments(departmentSearch.value);
        });
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterExamProjectTable);
    }
    if (dataFilter) {
        dataFilter.addEventListener('change', filterExamProjectTable);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterExamProjectTable);
    }
    if (departmentForm) {
        departmentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveExamDepartment();
        });
    }
    if (itemForm) {
        itemForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveExamItemEdit();
        });
    }
    inputTypeCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', updateExamProjectInputTypeFields);
    });
}

function renderExamProjectDepartments(searchText) {
    const list = document.getElementById('exam-project-department-list');
    const total = document.getElementById('exam-project-department-count');
    if (!list) return;

    const q = (searchText || '').trim().toLowerCase();
    const departments = getExamProjectDepartments();
    list.innerHTML = '';

    departments.forEach(function (department) {
        const rows = getExamProjectRowsByDepartment(department);
        const categories = getUniqueValues(rows, 'category');
        const items = getUniqueValues(rows, 'item');
        const remark = examProjectDepartmentRemarks[department] || '';
        const matches = !q ||
            department.toLowerCase().indexOf(q) !== -1 ||
            remark.toLowerCase().indexOf(q) !== -1 ||
            categories.join(' ').toLowerCase().indexOf(q) !== -1;
        if (!matches) return;

        const item = document.createElement('div');
        item.className = 'project-department-row' + (department === currentExamProjectDepartment ? ' active' : '');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-department-item';
        button.onclick = function () {
            setExamProjectDepartment(department);
        };
        button.innerHTML = `
            <span class="project-department-name">${department}</span>
            <span class="project-department-meta">${categories.length}类 / ${items.length}项 / ${rows.length}子项</span>
            ${remark ? '<span class="project-department-note">备注：' + remark + '</span>' : ''}
        `;
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'project-department-edit';
        editBtn.textContent = '编辑';
        editBtn.onclick = function () {
            showEditExamDepartment(department);
        };
        item.appendChild(button);
        item.appendChild(editBtn);
        list.appendChild(item);
    });

    if (total) {
        total.textContent = departments.length + '个科室';
    }

    if (!list.children.length) {
        list.innerHTML = '<div class="project-empty">暂无匹配科室</div>';
    }
}

function showAddExamDepartment() {
    const modal = document.getElementById('exam-department-modal');
    const form = document.getElementById('exam-department-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('exam-department-modal-title').textContent = '新增体检科室';
    document.getElementById('exam-department-mode').value = 'add';
    document.getElementById('exam-department-original-name').value = '';
    modal.classList.add('active');
    setTimeout(function () {
        const nameInput = document.getElementById('exam-department-name');
        if (nameInput) nameInput.focus();
    }, 0);
}

function showEditExamDepartment(department) {
    const modal = document.getElementById('exam-department-modal');
    const form = document.getElementById('exam-department-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('exam-department-modal-title').textContent = '编辑体检科室';
    document.getElementById('exam-department-mode').value = 'edit';
    document.getElementById('exam-department-original-name').value = department;
    document.getElementById('exam-department-name').value = department;
    document.getElementById('exam-department-remark').value = examProjectDepartmentRemarks[department] || '';
    modal.classList.add('active');
    setTimeout(function () {
        const nameInput = document.getElementById('exam-department-name');
        if (nameInput) nameInput.focus();
    }, 0);
}

function closeExamDepartmentModal() {
    const modal = document.getElementById('exam-department-modal');
    if (modal) modal.classList.remove('active');
}

function saveExamDepartment() {
    const nameInput = document.getElementById('exam-department-name');
    const remarkInput = document.getElementById('exam-department-remark');
    if (!nameInput) return;

    const mode = document.getElementById('exam-department-mode').value || 'add';
    const originalName = document.getElementById('exam-department-original-name').value;
    const department = nameInput.value.trim();
    const remark = remarkInput ? remarkInput.value.trim() : '';
    if (!department) {
        alert('请输入体检科室名称');
        nameInput.focus();
        return;
    }
    if (department !== originalName && getExamProjectDepartments().indexOf(department) !== -1) {
        alert('该体检科室已存在');
        nameInput.focus();
        return;
    }

    if (mode === 'edit') {
        renameExamProjectDepartment(originalName, department, remark);
    } else {
        examProjectDepartments.push(department);
        examProjectDepartmentRemarks[department] = remark;
    }
    const departmentSearch = document.getElementById('exam-project-department-search');
    if (departmentSearch) departmentSearch.value = '';
    closeExamDepartmentModal();
    setExamProjectDepartment(department);
}

function renameExamProjectDepartment(originalName, newName, remark) {
    if (!originalName) return;

    examProjectDepartments = examProjectDepartments.map(function (department) {
        return department === originalName ? newName : department;
    });
    examProjectData.forEach(function (row) {
        if (row.department === originalName) {
            row.department = newName;
        }
    });
    Object.keys(packageData).forEach(function (packageId) {
        const pkg = packageData[packageId];
        if (pkg.departments) {
            pkg.departments = pkg.departments.map(function (department) {
                return department === originalName ? newName : department;
            });
        }
        if (pkg.examItems) {
            pkg.examItems.forEach(function (item) {
                if (item.department === originalName) {
                    item.department = newName;
                }
            });
        }
    });

    delete examProjectDepartmentRemarks[originalName];
    examProjectDepartmentRemarks[newName] = remark;
    if (currentExamProjectDepartment === originalName) {
        currentExamProjectDepartment = newName;
    }
}

function setExamProjectDepartment(department) {
    currentExamProjectDepartment = department;
    currentExamProjectItem = '';
    const title = document.getElementById('exam-project-current-department');
    const categoryFilter = document.getElementById('exam-project-category-filter');
    const rows = getExamProjectRowsByDepartment(department);
    const categories = getUniqueValues(rows, 'category');

    if (title) {
        title.textContent = department;
    }
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">全部</option>';
        categories.forEach(function (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    updateExamProjectStats(rows);
    renderExamProjectDepartments(document.getElementById('exam-project-department-search') ? document.getElementById('exam-project-department-search').value : '');
    filterExamProjectTable();
}

function updateExamProjectStats(rows) {
    const categoryTotal = document.getElementById('exam-project-category-total');
    const itemTotal = document.getElementById('exam-project-item-total');
    const subItemTotal = document.getElementById('exam-project-subitem-total');
    if (categoryTotal) categoryTotal.textContent = getUniqueValues(rows, 'category').length;
    if (itemTotal) itemTotal.textContent = getUniqueValues(rows, 'item').length;
    if (subItemTotal) subItemTotal.textContent = rows.length;
}

function filterExamProjectTable() {
    const categoryFilter = document.getElementById('exam-project-category-filter');
    const dataFilter = document.getElementById('exam-project-data-filter');
    const searchInput = document.getElementById('exam-project-search');
    const rows = getExamProjectRowsByDepartment(currentExamProjectDepartment);
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const dataValue = dataFilter ? dataFilter.value : '';
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = rows.filter(function (row) {
        const searchable = [row.category, row.item, row.subItem, row.inputType, row.dataType, row.unit, row.options, row.reference, row.remark].join(' ').toLowerCase();
        return (!categoryValue || row.category === categoryValue) &&
            (!dataValue || row.dataType === dataValue) &&
            (!q || searchable.indexOf(q) !== -1);
    });

    const items = getUniqueValues(filtered, 'item');
    if (!currentExamProjectItem || items.indexOf(currentExamProjectItem) === -1) {
        currentExamProjectItem = items.length ? items[0] : '';
    }
    renderExamProjectItemNav(filtered);
    renderExamProjectSubItems(filtered.filter(function (row) {
        return row.item === currentExamProjectItem;
    }));
}

function renderExamProjectItemNav(rows) {
    const nav = document.getElementById('exam-project-item-nav');
    const count = document.getElementById('exam-project-item-count');
    if (!nav) return;

    const items = getUniqueValues(rows, 'item');
    nav.innerHTML = '';
    if (count) {
        count.textContent = items.length + '项';
    }
    if (!items.length) {
        nav.innerHTML = '<div class="project-empty">暂无体检项</div>';
        return;
    }

    items.forEach(function (item) {
        const itemRows = rows.filter(function (row) {
            return row.item === item;
        });
        const row = document.createElement('div');
        row.className = 'project-item-nav-row' + (item === currentExamProjectItem ? ' active' : '');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-item-nav-button';
        button.onclick = function () {
            currentExamProjectItem = item;
            filterExamProjectTable();
        };
        button.innerHTML = `
            <span class="project-item-name">${item}</span>
            <span class="project-item-meta">${getUniqueValues(itemRows, 'category').join(' / ')} · ${itemRows.length}个子项</span>
        `;
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'project-item-edit';
        editBtn.textContent = '编辑';
        editBtn.onclick = function () {
            showEditExamItem(item);
        };
        row.appendChild(button);
        row.appendChild(editBtn);
        nav.appendChild(row);
    });
}

function renderExamProjectSubItems(rows) {
    const container = document.getElementById('exam-project-content');
    const currentItem = document.getElementById('exam-project-current-item');
    const currentItemCount = document.getElementById('exam-project-current-item-count');
    if (!container) return;

    container.innerHTML = '';
    if (currentItem) {
        currentItem.textContent = currentExamProjectItem || '-';
    }
    if (currentItemCount) {
        currentItemCount.textContent = rows.length + '个子项';
    }
    if (!rows.length) {
        container.innerHTML = '<div class="project-empty project-empty-large">暂无匹配体检子项</div>';
        return;
    }

    const categories = getUniqueValues(rows, 'category');
    categories.forEach(function (category) {
        const categoryRows = rows.filter(function (row) {
            return row.category === category;
        });
        const section = document.createElement('section');
        section.className = 'project-category-section';
        section.innerHTML = `
            <div class="project-category-header">
                <h4>${category}</h4>
                <span>${categoryRows.length}个体检子项</span>
            </div>
            <div class="project-table-wrap">
                <table class="data-table project-data-table">
                    <thead>
                        <tr>
                            <th>体检子项</th>
                            <th>输入类型</th>
                            <th>数据类型</th>
                            <th>单位</th>
                            <th>下拉选择项</th>
                            <th>参考值/正常范围</th>
                            <th>诊断说明</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
        const tbody = section.querySelector('tbody');
        categoryRows.forEach(function (row) {
            const tr = document.createElement('tr');
            const rowIndex = examProjectData.indexOf(row);
            const status = row.status || '启用';
            const statusClass = status === '启用' ? 'active' : 'inactive';
            const toggleText = status === '启用' ? '停用' : '启用';
            const toggleClass = status === '启用' ? 'btn-secondary' : 'btn-view';
            tr.innerHTML = `
                <td class="project-subitem-name">${row.subItem}</td>
                <td><span class="project-pill">${row.inputType}</span></td>
                <td>${row.dataType}</td>
                <td>${row.unit}</td>
                <td>${row.options}</td>
                <td class="project-reference">${row.reference}</td>
                <td>${row.remark}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-edit" type="button" onclick="showEditExamSubItemModal(${rowIndex})">编辑</button>
                    <button class="btn btn-sm ${toggleClass}" type="button" onclick="toggleExamSubItemStatus(${rowIndex})">${toggleText}</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        container.appendChild(section);
    });
}

function showEditExamItem(itemName) {
    const rows = getExamProjectRowsByDepartment(currentExamProjectDepartment).filter(function (row) {
        return row.item === itemName;
    });
    if (!rows.length) {
        alert('体检项不存在');
        return;
    }

    const modal = document.getElementById('exam-item-modal');
    const form = document.getElementById('exam-item-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('exam-item-original-name').value = itemName;
    document.getElementById('exam-item-department').value = currentExamProjectDepartment;
    setExamCategorySelectValue('exam-item-category', rows[0].category || '');
    document.getElementById('exam-item-name').value = itemName;
    modal.classList.add('active');
    setTimeout(function () {
        const itemInput = document.getElementById('exam-item-name');
        if (itemInput) itemInput.focus();
    }, 0);
}

function closeExamItemModal() {
    const modal = document.getElementById('exam-item-modal');
    if (modal) modal.classList.remove('active');
}

function saveExamItemEdit() {
    const department = document.getElementById('exam-item-department').value.trim();
    const originalName = document.getElementById('exam-item-original-name').value;
    const category = document.getElementById('exam-item-category').value.trim();
    const itemName = document.getElementById('exam-item-name').value.trim();

    if (!category) {
        alert('请输入检查类别');
        document.getElementById('exam-item-category').focus();
        return;
    }
    if (!itemName) {
        alert('请输入体检项名称');
        document.getElementById('exam-item-name').focus();
        return;
    }

    const duplicate = getExamProjectRowsByDepartment(department).some(function (row) {
        return row.item === itemName && row.item !== originalName;
    });
    if (duplicate) {
        alert('该体检项名称已存在');
        document.getElementById('exam-item-name').focus();
        return;
    }

    renameExamProjectItem(department, originalName, itemName, category);
    closeExamItemModal();
    currentExamProjectDepartment = department;
    currentExamProjectItem = itemName;
    setExamProjectDepartment(department);
    currentExamProjectItem = itemName;
    const categoryFilter = document.getElementById('exam-project-category-filter');
    if (categoryFilter) categoryFilter.value = category;
    filterExamProjectTable();
}

function renameExamProjectItem(department, originalName, newName, category) {
    examProjectData.forEach(function (row) {
        if (row.department === department && row.item === originalName) {
            row.item = newName;
            row.category = category;
        }
    });
    Object.keys(packageData).forEach(function (packageId) {
        const pkg = packageData[packageId];
        (pkg.examItems || []).forEach(function (item) {
            if (item.department === department && item.examItem === originalName) {
                item.examItem = newName;
                item.category = category;
            }
        });
    });
}

function setExamProjectFormValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value == null ? '' : value;
}

function setExamCategorySelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = examCategoryOptions.indexOf(value) !== -1 ? value : examCategoryOptions[0];
}

function getSelectedExamInputTypes() {
    const selected = [];
    document.querySelectorAll('.exam-input-type-checkbox:checked').forEach(function (checkbox) {
        selected.push(checkbox.value);
    });
    return selected;
}

function setSelectedExamInputTypes(value) {
    const raw = value || '填写';
    const selected = raw.split(/[、,，/]/).map(function (item) {
        return item.trim();
    }).filter(Boolean);
    const normalized = selected.length ? selected : ['填写'];

    document.querySelectorAll('.exam-input-type-checkbox').forEach(function (checkbox) {
        checkbox.checked = normalized.indexOf(checkbox.value) !== -1;
    });
    updateExamProjectInputTypeFields();
}

function toggleExamInputTypeMenu() {
    const menu = document.getElementById('exam-project-input-type-menu');
    if (!menu) return;
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function closeExamInputTypeMenu() {
    const menu = document.getElementById('exam-project-input-type-menu');
    if (menu) menu.style.display = 'none';
}

function updateExamProjectInputTypeFields() {
    const selected = getSelectedExamInputTypes();
    const fillFields = document.getElementById('exam-project-fill-fields');
    const fillReferenceFields = document.getElementById('exam-project-fill-reference-fields');
    const dropdownFields = document.getElementById('exam-project-dropdown-fields');
    const button = document.getElementById('exam-project-input-type-button');

    if (!selected.length) {
        const fillCheckbox = document.querySelector('.exam-input-type-checkbox[value="填写"]');
        if (fillCheckbox) fillCheckbox.checked = true;
        selected.push('填写');
    }

    const hasFill = selected.indexOf('填写') !== -1;
    const hasDropdown = selected.indexOf('下拉') !== -1;
    if (fillFields) fillFields.style.display = hasFill ? '' : 'none';
    if (fillReferenceFields) fillReferenceFields.style.display = hasFill ? '' : 'none';
    if (dropdownFields) dropdownFields.style.display = hasDropdown ? '' : 'none';
    if (button) button.textContent = selected.join('、');
}

function getCurrentExamProjectCategory() {
    const rows = getExamProjectRowsByDepartment(currentExamProjectDepartment).filter(function (row) {
        return row.item === currentExamProjectItem;
    });
    if (rows.length) return rows[0].category;
    const categoryFilter = document.getElementById('exam-project-category-filter');
    return categoryFilter && categoryFilter.value ? categoryFilter.value : '';
}

function setExamProjectFormReadOnly(mode) {
    const category = document.getElementById('exam-project-form-category');
    const item = document.getElementById('exam-project-form-item');
    if (category) category.disabled = mode === 'add-subitem';
    if (item) item.readOnly = mode === 'add-subitem' || mode === 'edit-subitem';
}

function openExamProjectModal(mode, row, rowIndex) {
    const modal = document.getElementById('exam-project-modal');
    const title = document.getElementById('exam-project-modal-title');
    const form = document.getElementById('exam-project-form');
    if (!modal || !form) return;

    form.reset();
    setExamProjectFormValue('exam-project-modal-mode', mode);
    setExamProjectFormValue('exam-project-edit-index', rowIndex != null ? rowIndex : '');
    setExamProjectFormValue('exam-project-form-department', row.department || currentExamProjectDepartment);
    setExamCategorySelectValue('exam-project-form-category', row.category || getCurrentExamProjectCategory());
    setExamProjectFormValue('exam-project-form-item', row.item || currentExamProjectItem);
    setExamProjectFormValue('exam-project-form-subitem', row.subItem || '');
    setSelectedExamInputTypes(row.inputType || '填写');
    setExamProjectFormValue('exam-project-form-data-type', row.dataType || '数字');
    setExamProjectFormValue('exam-project-form-unit', row.unit || '');
    setExamProjectFormValue('exam-project-form-options', row.options === '-' ? '' : (row.options || ''));
    setExamProjectFormValue('exam-project-form-reference', row.reference || '');
    setExamProjectFormValue('exam-project-form-remark', row.remark || '-');
    setExamProjectFormReadOnly(mode);

    if (title) {
        if (mode === 'add-item') title.textContent = '新增体检项';
        if (mode === 'add-subitem') title.textContent = '新增体检子项';
        if (mode === 'edit-subitem') title.textContent = '编辑体检子项';
    }
    modal.classList.add('active');
}

function showAddExamItemModal() {
    if (!currentExamProjectDepartment) {
        alert('请先选择体检科室');
        return;
    }
    openExamProjectModal('add-item', {
        department: currentExamProjectDepartment,
        category: getCurrentExamProjectCategory(),
        item: '',
        subItem: '',
        inputType: '填写',
        dataType: '数字',
        unit: '',
        options: '-',
        reference: '',
        remark: '-'
    });
}

function showAddExamSubItemModal() {
    if (!currentExamProjectDepartment || !currentExamProjectItem) {
        alert('请先选择体检项');
        return;
    }
    openExamProjectModal('add-subitem', {
        department: currentExamProjectDepartment,
        category: getCurrentExamProjectCategory(),
        item: currentExamProjectItem,
        subItem: '',
        inputType: '填写',
        dataType: '数字',
        unit: '',
        options: '-',
        reference: '',
        remark: '-'
    });
}

function showEditExamSubItemModal(rowIndex) {
    const row = examProjectData[rowIndex];
    if (!row) {
        alert('体检子项不存在');
        return;
    }
    openExamProjectModal('edit-subitem', row, rowIndex);
}

function closeExamProjectModal() {
    const modal = document.getElementById('exam-project-modal');
    if (modal) modal.classList.remove('active');
}

function buildExamProjectRowFromForm() {
    const inputTypes = getSelectedExamInputTypes();
    const hasFill = inputTypes.indexOf('填写') !== -1;
    const hasDropdown = inputTypes.indexOf('下拉') !== -1;
    return {
        department: document.getElementById('exam-project-form-department').value.trim(),
        category: document.getElementById('exam-project-form-category').value.trim(),
        item: document.getElementById('exam-project-form-item').value.trim(),
        subItem: document.getElementById('exam-project-form-subitem').value.trim(),
        inputType: inputTypes.join('/'),
        dataType: hasFill ? document.getElementById('exam-project-form-data-type').value : '-',
        unit: hasFill ? (document.getElementById('exam-project-form-unit').value.trim() || '-') : '-',
        options: hasDropdown ? (document.getElementById('exam-project-form-options').value.trim() || '-') : '-',
        reference: hasFill ? (document.getElementById('exam-project-form-reference').value.trim() || '-') : '-',
        remark: hasFill ? (document.getElementById('exam-project-form-remark').value.trim() || '-') : '-',
        status: '启用'
    };
}

function refreshExamProjectViewAfterChange(row) {
    currentExamProjectDepartment = row.department;
    currentExamProjectItem = row.item;
    const searchInput = document.getElementById('exam-project-search');
    const dataFilter = document.getElementById('exam-project-data-filter');
    if (searchInput) searchInput.value = '';
    if (dataFilter) dataFilter.value = '';
    setExamProjectDepartment(row.department);
    currentExamProjectItem = row.item;
    const categoryFilter = document.getElementById('exam-project-category-filter');
    if (categoryFilter) categoryFilter.value = row.category;
    filterExamProjectTable();
}

function saveExamProjectForm() {
    const mode = document.getElementById('exam-project-modal-mode').value;
    const editIndexValue = document.getElementById('exam-project-edit-index').value;
    const row = buildExamProjectRowFromForm();

    if (!row.department) {
        alert('请选择体检科室');
        return;
    }
    if (!row.category) {
        alert('请输入检查类别');
        return;
    }
    if (!row.item) {
        alert('请输入体检项');
        return;
    }
    if (!row.subItem) {
        alert('请输入体检子项');
        return;
    }
    if (!row.inputType) {
        alert('请选择输入类型');
        return;
    }

    if (mode === 'edit-subitem') {
        const index = parseInt(editIndexValue, 10);
        if (isNaN(index) || !examProjectData[index]) {
            alert('体检子项不存在');
            return;
        }
        row.status = examProjectData[index].status || '启用';
        examProjectData[index] = row;
    } else {
        row.status = '启用';
        examProjectData.push(row);
    }

    closeExamProjectModal();
    refreshExamProjectViewAfterChange(row);
}

function toggleExamSubItemStatus(rowIndex) {
    const row = examProjectData[rowIndex];
    if (!row) {
        alert('体检子项不存在');
        return;
    }
    row.status = row.status === '停用' ? '启用' : '停用';
    currentExamProjectDepartment = row.department;
    currentExamProjectItem = row.item;
    updateExamProjectStats(getExamProjectRowsByDepartment(row.department));
    renderExamProjectDepartments(document.getElementById('exam-project-department-search') ? document.getElementById('exam-project-department-search').value : '');
    filterExamProjectTable();
}

// 套餐管理列表筛选（状态 + 套餐名称）
function filterPackageTable() {
    var statusFilter = document.getElementById('package-status-filter');
    var searchInput = document.getElementById('package-search');
    var tbody = document.getElementById('package-table-body');
    if (!tbody) return;
    var statusVal = statusFilter ? statusFilter.value : '';
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    tbody.querySelectorAll('tr').forEach(function (row) {
        var rowStatus = row.getAttribute('data-status') || '';
        var nameCell = row.cells[1];
        var nameText = nameCell ? nameCell.textContent.trim().toLowerCase() : '';
        var okStatus = !statusVal || rowStatus === statusVal;
        var okSearch = !q || nameText.indexOf(q) !== -1;
        row.style.display = okStatus && okSearch ? '' : 'none';
    });
}

function filterExaminationTable() {
    var statusFilter = document.getElementById('examination-department-status');
    var categoryFilter = document.getElementById('examination-department');
    var dateInput = document.getElementById('examination-date');
    var searchInput = document.getElementById('examination-search');
    var tbody = document.getElementById('examination-table-body');
    if (!tbody) return;
    var statusVal = statusFilter ? statusFilter.value : '';
    var catVal = categoryFilter ? categoryFilter.value : '';
    var dateVal = dateInput ? dateInput.value.trim() : '';
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    tbody.querySelectorAll('tr').forEach(function (row) {
        var rowStatus = row.getAttribute('data-status') || '';
        var rowCat = row.getAttribute('data-category') || '';
        var rowDate = row.getAttribute('data-exam-date') || '';
        var nameCell = row.cells[2];
        var nameText = nameCell ? nameCell.textContent.trim().toLowerCase() : '';
        var okStatus = !statusVal || rowStatus === statusVal;
        var okCat = !catVal || rowCat === catVal;
        var okDate = !dateVal || rowDate === dateVal;
        var okSearch = !q || nameText.indexOf(q) !== -1;
        row.style.display = okStatus && okCat && okDate && okSearch ? '' : 'none';
    });
}

function initializeExaminationPage() {
    var statusFilter = document.getElementById('examination-department-status');
    var categoryFilter = document.getElementById('examination-department');
    var dateInput = document.getElementById('examination-date');
    var searchInput = document.getElementById('examination-search');
    var searchBtn = document.querySelector('#examination-page .search-btn');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterExaminationTable);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterExaminationTable);
    }
    if (dateInput) {
        dateInput.addEventListener('change', filterExaminationTable);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterExaminationTable);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            filterExaminationTable();
        });
    }
}

function initializePackagePage() {
    var statusFilter = document.getElementById('package-status-filter');
    var searchInput = document.getElementById('package-search');
    var searchBtn = document.querySelector('#package-page .search-btn');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterPackageTable);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterPackageTable);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            filterPackageTable();
        });
    }
}

function filterAppointmentList() {
    var nameInput = document.getElementById('appointment-filter-name');
    var phoneInput = document.getElementById('appointment-filter-phone');
    var statusSel = document.getElementById('appointment-filter-status');
    var tbody = document.getElementById('appointment-table-body');
    if (!tbody) return;
    var nameQ = nameInput ? nameInput.value.trim().toLowerCase() : '';
    var phoneQ = phoneInput ? phoneInput.value.trim() : '';
    var statusVal = statusSel ? statusSel.value : '';
    tbody.querySelectorAll('tr').forEach(function (row) {
        var rowName = (row.getAttribute('data-name') || '').toLowerCase();
        var rowPhone = row.getAttribute('data-phone') || '';
        var rowStatus = row.getAttribute('data-status') || '';
        var okName = !nameQ || rowName.indexOf(nameQ) !== -1;
        var okPhone = !phoneQ || rowPhone.indexOf(phoneQ) !== -1;
        var okStatus = !statusVal || rowStatus === statusVal;
        row.style.display = okName && okPhone && okStatus ? '' : 'none';
    });
}

function resetAppointmentFilters() {
    var nameInput = document.getElementById('appointment-filter-name');
    var phoneInput = document.getElementById('appointment-filter-phone');
    var statusSel = document.getElementById('appointment-filter-status');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (statusSel) statusSel.value = '';
    filterAppointmentList();
}

function refreshAppointmentList() {
    filterAppointmentList();
}

function appointmentCheckIn(appointmentId) {
    var appt = appointmentData[appointmentId];
    if (!appt) {
        alert('预约不存在');
        return;
    }
    if (appt.status === '已签到') {
        alert('该预约已签到');
        return;
    }
    if (appt.status === '已取消') {
        alert('已取消的预约无法签到');
        return;
    }
    if (confirm('确认将该预约标记为已签到？')) {
        alert('签到成功（演示数据未写回表格，可对接接口后刷新列表）');
    }
}

function appointmentCancel(appointmentId) {
    var appt = appointmentData[appointmentId];
    if (!appt) {
        alert('预约不存在');
        return;
    }
    if (appt.status === '已取消') {
        alert('该预约已取消');
        return;
    }
    if (confirm('确认取消该预约？')) {
        alert('已取消（演示数据未写回表格，可对接接口后刷新列表）');
    }
}

function initializeAppointmentListPage() {
    var statusSel = document.getElementById('appointment-filter-status');
    if (statusSel) {
        statusSel.addEventListener('change', filterAppointmentList);
    }
}

function renderPackageExamItems() {
    const container = document.getElementById('package-department-list');
    if (!container) return;

    normalizeExamProjectStatuses();
    const enabledRows = examProjectData.filter(function (row) {
        return row.status === '启用';
    });
    const departments = getUniqueValues(enabledRows, 'department');
    container.innerHTML = '';

    if (!enabledRows.length) {
        container.innerHTML = '<div class="project-empty">暂无启用中的体检子项</div>';
        return;
    }

    departments.forEach(function (department, deptIndex) {
        const deptRows = enabledRows.filter(function (row) {
            return row.department === department;
        });
        const deptId = 'pkg-dynamic-dept-' + deptIndex;
        const departmentItem = document.createElement('div');
        departmentItem.className = 'department-item';
        departmentItem.setAttribute('data-dept', department);
        departmentItem.innerHTML = `
            <div class="department-header">
                <input type="checkbox" id="${deptId}" class="dept-checkbox" value="${department}">
                <label for="${deptId}" class="dept-label">${department}</label>
            </div>
            <div class="dept-categories"></div>
        `;

        const categoryContainer = departmentItem.querySelector('.dept-categories');
        getUniqueValues(deptRows, 'category').forEach(function (category, categoryIndex) {
            const categoryRows = deptRows.filter(function (row) {
                return row.category === category;
            });
            const categoryId = 'pkg-dynamic-cat-' + deptIndex + '-' + categoryIndex;
            const categoryBlock = document.createElement('div');
            categoryBlock.className = 'exam-category-block';
            categoryBlock.setAttribute('data-dept', department);
            categoryBlock.setAttribute('data-category', category);
            categoryBlock.innerHTML = `
                <div class="category-header">
                    <input type="checkbox" id="${categoryId}" class="category-checkbox" data-dept="${department}" value="${category}">
                    <label for="${categoryId}" class="category-label">${category}</label>
                </div>
                <div class="exam-items-list"></div>
            `;

            const itemContainer = categoryBlock.querySelector('.exam-items-list');
            getUniqueValues(categoryRows, 'item').forEach(function (itemName) {
                const itemRows = categoryRows.filter(function (row) {
                    return row.item === itemName;
                });
                const itemGroup = document.createElement('div');
                itemGroup.className = 'package-item-group';
                itemGroup.innerHTML = '<div class="package-item-title">' + itemName + '</div>';
                itemRows.forEach(function (row, rowIndex) {
                    const globalIndex = examProjectData.indexOf(row);
                    const checkboxId = 'pkg-dynamic-exam-' + globalIndex + '-' + rowIndex;
                    const checkboxWrap = document.createElement('div');
                    checkboxWrap.className = 'exam-item';
                    checkboxWrap.innerHTML = `
                        <input type="checkbox" id="${checkboxId}" class="exam-checkbox" value="${row.subItem}" data-dept="${department}" data-category="${category}" data-item="${itemName}">
                        <label for="${checkboxId}">${row.subItem}</label>
                    `;
                    itemGroup.appendChild(checkboxWrap);
                });
                itemContainer.appendChild(itemGroup);
            });
            categoryContainer.appendChild(categoryBlock);
        });

        container.appendChild(departmentItem);
    });
}

function getPackageAdjustmentWarnings() {
    normalizeExamProjectStatuses();
    const disabledRows = examProjectData.filter(function (row) {
        return row.status === '停用';
    });
    if (!disabledRows.length) return [];

    const warnings = [];
    Object.keys(packageData).forEach(function (packageId) {
        const pkg = packageData[packageId];
        const disabledItems = [];
        (pkg.examItems || []).forEach(function (pkgItem) {
            const disabledRow = disabledRows.find(function (row) {
                return row.department === pkgItem.department &&
                    row.category === pkgItem.category &&
                    row.item === pkgItem.examItem &&
                    row.subItem === pkgItem.subItem;
            });
            if (disabledRow) {
                disabledItems.push({
                    department: pkgItem.department,
                    category: pkgItem.category,
                    examItem: pkgItem.examItem,
                    subItem: pkgItem.subItem
                });
            }
        });
        if (disabledItems.length) {
            warnings.push({
                packageId: packageId,
                packageName: pkg.name,
                disabledItems: disabledItems
            });
        }
    });
    return warnings;
}

function getPackageAdjustmentTotals(warnings) {
    return warnings.reduce(function (sum, warning) {
        return sum + warning.disabledItems.length;
    }, 0);
}

function renderPackageAdjustmentBanner(warnings) {
    const banner = document.getElementById('package-adjustment-banner');
    if (!banner) return;

    if (!warnings.length) {
        banner.style.display = 'none';
        banner.innerHTML = '';
        return;
    }

    const itemTotal = getPackageAdjustmentTotals(warnings);
    banner.style.display = 'flex';
    banner.innerHTML = `
        <div>
            <strong>套餐项目已调整</strong>
            <span>${warnings.length}个套餐包含${itemTotal}个已停用体检子项，请确认套餐内容。</span>
        </div>
        <div class="package-adjustment-banner-actions">
            <button class="btn btn-sm btn-secondary" type="button" onclick="openExamProjectFromPackageWarning()">查看项目状态</button>
            <button class="btn btn-sm btn-primary" type="button" onclick="showPackageAdjustmentModal()">查看详情</button>
        </div>
    `;
}

function renderPackageAdjustmentModal(warnings) {
    const list = document.getElementById('package-adjustment-list');
    const title = document.getElementById('package-adjustment-summary-title');
    const text = document.getElementById('package-adjustment-summary-text');
    if (!list) return;

    const itemTotal = getPackageAdjustmentTotals(warnings);
    if (title) title.textContent = '检测到' + warnings.length + '个套餐需要确认';
    if (text) text.textContent = '以下套餐引用了已停用的体检子项，这些子项将不会出现在新的套餐选择列表中。';

    list.innerHTML = '';
    warnings.forEach(function (warning) {
        const card = document.createElement('div');
        card.className = 'package-adjustment-card';
        card.innerHTML = `
            <div class="package-adjustment-card-header">
                <div>
                    <strong>${warning.packageName}</strong>
                    <span>${warning.packageId}</span>
                </div>
                <button class="btn btn-sm btn-secondary" type="button" onclick="removeDisabledItemsFromPackage('${warning.packageId}')">移除不可用项</button>
            </div>
            <div class="package-adjustment-items"></div>
        `;
        const items = card.querySelector('.package-adjustment-items');
        warning.disabledItems.forEach(function (item) {
            const row = document.createElement('div');
            row.className = 'package-adjustment-item';
            row.innerHTML = `
                <span class="status-badge inactive">停用</span>
                <div>
                    <strong>${item.subItem}</strong>
                    <span>${item.department} / ${item.category} / ${item.examItem}</span>
                </div>
            `;
            items.appendChild(row);
        });
        list.appendChild(card);
    });

    if (!warnings.length) {
        list.innerHTML = '<div class="project-empty project-empty-large">当前套餐没有不可用体检子项</div>';
    }
}

function showPackageAdjustmentModal() {
    const warnings = getPackageAdjustmentWarnings();
    renderPackageAdjustmentBanner(warnings);
    renderPackageAdjustmentModal(warnings);
    const modal = document.getElementById('package-adjustment-modal');
    if (modal) modal.classList.add('active');
}

function closePackageAdjustmentModal() {
    const modal = document.getElementById('package-adjustment-modal');
    if (modal) modal.classList.remove('active');
}

function handleEnterPackagePage() {
    const warnings = getPackageAdjustmentWarnings();
    renderPackageAdjustmentBanner(warnings);
    if (warnings.length) {
        showPackageAdjustmentModal();
    }
}

function removeDisabledItemsFromPackage(packageId) {
    const pkg = packageData[packageId];
    if (!pkg) return;
    const warnings = getPackageAdjustmentWarnings();
    const warning = warnings.find(function (row) {
        return row.packageId === packageId;
    });
    if (!warning) return;
    pkg.examItems = (pkg.examItems || []).filter(function (pkgItem) {
        return !warning.disabledItems.some(function (disabledItem) {
            return disabledItem.department === pkgItem.department &&
                disabledItem.category === pkgItem.category &&
                disabledItem.examItem === pkgItem.examItem &&
                disabledItem.subItem === pkgItem.subItem;
        });
    });

    const nextWarnings = getPackageAdjustmentWarnings();
    renderPackageAdjustmentBanner(nextWarnings);
    renderPackageAdjustmentModal(nextWarnings);
    if (!nextWarnings.length) {
        closePackageAdjustmentModal();
        alert('不可用体检子项已从套餐中移除');
    }
}

function removeAllDisabledItemsFromPackages() {
    const warnings = getPackageAdjustmentWarnings();
    warnings.forEach(function (warning) {
        removeDisabledItemsFromPackage(warning.packageId);
    });
    renderPackageAdjustmentBanner(getPackageAdjustmentWarnings());
}

function openExamProjectFromPackageWarning() {
    closePackageAdjustmentModal();
    const nav = document.querySelector('.nav-item[data-page="exam-project"]');
    if (nav) nav.click();
}

// 套餐管理相关功能
function showAddPackageModal() {
    document.getElementById('package-modal').classList.add('active');
    renderPackageExamItems();
    // 重置表单
    document.getElementById('package-form').reset();
    document.querySelectorAll('#package-department-list input[type="checkbox"]').forEach(function (cb) {
        cb.indeterminate = false;
    });
    document.querySelector('#package-modal .modal-header h3').textContent = '新增套餐';
    
    // 初始化科室和检查项的联动
    initDepartmentExamItems();
}

function editPackage(id) {
    document.getElementById('package-modal').classList.add('active');
    document.querySelector('#package-modal .modal-header h3').textContent = '编辑套餐';
    renderPackageExamItems();
    
    // 初始化科室和检查项的联动
    initDepartmentExamItems();
    
    // 这里可以根据ID加载套餐数据
    // 示例：模拟加载数据
    console.log('编辑套餐 ID:', id);
}

function closePackageModal() {
    document.getElementById('package-modal').classList.remove('active');
}

function savePackage() {
    const form = document.getElementById('package-form');
    const formData = new FormData(form);
    
    // 获取选中的科室和检查项
    const selectedData = getSelectedDepartmentsAndExams();
    
    // 获取当前登录用户作为创建人
    const creator = getCurrentUser();
    
    const newPackageData = {
        name: formData.get('packageName'),
        gender: formData.get('gender'),
        departments: selectedData.departments,
        examItems: selectedData.examItems, // 添加检查项数据
        status: formData.get('status'),
        creator: creator
    };
    
    console.log('保存套餐数据:', newPackageData);
    
    // 这里可以添加实际的保存逻辑
    // 保存后，创建人信息会显示在列表中
    alert('套餐保存成功！创建人：' + creator);
    closePackageModal();
}

// 初始化科室 / 检查类别 / 体检项 三层联动（仅绑定一次，避免重复监听）
function initDepartmentExamItems() {
    const modal = document.getElementById('package-modal');
    if (!modal || modal.dataset.deptItemsBound === '1') return;
    modal.dataset.deptItemsBound = '1';

    modal.addEventListener('change', function (e) {
        const t = e.target;
        if (t.classList.contains('dept-checkbox')) {
            const deptItem = t.closest('.department-item');
            if (!deptItem) return;
            deptItem.querySelectorAll('.category-checkbox').forEach(function (cb) {
                cb.checked = t.checked;
                cb.indeterminate = false;
            });
            deptItem.querySelectorAll('.exam-checkbox').forEach(function (cb) {
                cb.checked = t.checked;
            });
        } else if (t.classList.contains('category-checkbox')) {
            const dept = t.getAttribute('data-dept');
            const block = t.closest('.exam-category-block');
            if (block) {
                block.querySelectorAll('.exam-checkbox').forEach(function (cb) {
                    cb.checked = t.checked;
                });
            }
            updateDepartmentCheckboxState(dept);
        } else if (t.classList.contains('exam-checkbox')) {
            const dept = t.getAttribute('data-dept');
            const cat = t.getAttribute('data-category');
            updateCategoryCheckboxState(dept, cat);
            updateDepartmentCheckboxState(dept);
        }
    });
}

// 根据第三层体检项更新第二层检查类别复选框
function updateCategoryCheckboxState(deptName, categoryName) {
    const block = document.querySelector(
        '#package-department-list .exam-category-block[data-dept="' + deptName + '"][data-category="' + categoryName + '"]'
    );
    if (!block) return;
    const catCheckbox = block.querySelector('.category-checkbox');
    const exams = block.querySelectorAll('.exam-checkbox');
    const checked = block.querySelectorAll('.exam-checkbox:checked');
    if (!catCheckbox || exams.length === 0) return;
    if (checked.length === 0) {
        catCheckbox.checked = false;
        catCheckbox.indeterminate = false;
    } else if (checked.length === exams.length) {
        catCheckbox.checked = true;
        catCheckbox.indeterminate = false;
    } else {
        catCheckbox.checked = false;
        catCheckbox.indeterminate = true;
    }
}

// 根据所有第三层选项更新第一层体检科室复选框
function updateDepartmentCheckboxState(deptName) {
    const item = document.querySelector('#package-department-list .department-item[data-dept="' + deptName + '"]');
    if (!item) return;
    const deptCheckbox = item.querySelector('.dept-checkbox');
    const exams = item.querySelectorAll('.exam-checkbox');
    const checked = item.querySelectorAll('.exam-checkbox:checked');
    if (!deptCheckbox || exams.length === 0) return;
    if (checked.length === 0) {
        deptCheckbox.checked = false;
        deptCheckbox.indeterminate = false;
    } else if (checked.length === exams.length) {
        deptCheckbox.checked = true;
        deptCheckbox.indeterminate = false;
    } else {
        deptCheckbox.checked = false;
        deptCheckbox.indeterminate = true;
    }
}

// 获取选中的科室与检查项（含检查类别）
function getSelectedDepartmentsAndExams() {
    const examItems = [];
    document.querySelectorAll('#package-department-list .exam-checkbox:checked').forEach(function (cb) {
        examItems.push({
            department: cb.getAttribute('data-dept'),
            category: cb.getAttribute('data-category'),
            examItem: cb.getAttribute('data-item') || cb.value,
            subItem: cb.value
        });
    });
    const departments = [];
    examItems.forEach(function (row) {
        if (departments.indexOf(row.department) === -1) {
            departments.push(row.department);
        }
    });
    return {
        departments: departments,
        examItems: examItems
    };
}

// 患者详情数据（模拟数据，实际应该从API获取）
const patientData = {
    'PAT001': {
        name: '张三',
        gender: '男',
        birthdate: '1989-05-20',
        age: 35,
        phone: '13852058888',
        marital: '已婚',
        idType: '身份证',
        idNumber: '110101198905207788',
        source: '个人体检',
        company: '-',
        memberLevel: 'VIP',
        pid: 'PAT001',
        registerTime: '2024-01-15 10:30:00',
        lastExam: '2024-03-15',
        examCount: 3,
        status: '正常',
        allergy: '无',
        history: '无特殊病史，家族无遗传病史',
        bloodType: 'A型，Rh阳性',
        height: '175cm',
        weight: '72kg'
    },
    'PAT002': {
        name: '李四',
        gender: '女',
        birthdate: '1996-03-15',
        age: 28,
        phone: '13912349999',
        marital: '未婚',
        idType: '身份证',
        idNumber: '110101199603158899',
        source: '单位集体体检',
        company: 'XX科技有限公司 / 技术部',
        memberLevel: '普通会员',
        pid: 'PAT002',
        registerTime: '2024-01-20 14:20:00',
        lastExam: '2024-02-20',
        examCount: 2,
        status: '正常',
        allergy: '青霉素过敏',
        history: '无既往史，母亲有高血压病史',
        bloodType: 'B型，Rh阳性',
        height: '162cm',
        weight: '55kg'
    },
    'PAT003': {
        name: '王五',
        gender: '男',
        birthdate: '1982-08-10',
        age: 42,
        phone: '13713467777',
        marital: '已婚',
        idType: '身份证',
        idNumber: '110101198208109900',
        source: '个人体检',
        company: '-',
        memberLevel: '复检客户',
        pid: 'PAT003',
        registerTime: '2024-02-01 09:15:00',
        lastExam: '2024-02-01',
        examCount: 1,
        status: '正常',
        allergy: '无',
        history: '2018年曾行阑尾切除术，父亲有糖尿病史',
        bloodType: 'O型，Rh阳性',
        height: '178cm',
        weight: '80kg'
    },
    'PAT004': {
        name: '岳威',
        gender: '男',
        birthdate: '1990-01-15',
        age: 35,
        phone: '18612346410',
        marital: '已婚',
        idType: '身份证',
        idNumber: '110101199001151234',
        source: '个人体检',
        company: '-',
        memberLevel: 'VIP',
        pid: 'PAT004',
        registerTime: '2026-03-01 10:00:00',
        lastExam: '-',
        examCount: 0,
        status: '正常',
        allergy: '无',
        history: '无',
        bloodType: 'A型',
        height: '172cm',
        weight: '68kg'
    },
    'PAT005': {
        name: 'test3',
        gender: '女',
        birthdate: '1995-06-20',
        age: 30,
        phone: '13900000003',
        marital: '未婚',
        idType: '身份证',
        idNumber: '110101199506201234',
        source: '个人体检',
        company: '-',
        memberLevel: '普通会员',
        pid: 'PAT005',
        registerTime: '2026-03-10 14:00:00',
        lastExam: '-',
        examCount: 0,
        status: '正常',
        allergy: '无',
        history: '无',
        bloodType: 'O型',
        height: '165cm',
        weight: '52kg'
    }
};

// 计算年龄
function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// 当前查看的患者ID
let currentPatientId = null;

// 标记是否从预约页面打开新增患者弹窗
let isFromAppointment = false;

// 存储完整敏感信息（用于显示/隐藏切换）
const sensitiveInfoStore = {
    'detail-phone': { full: '', masked: '' },
    'detail-id-number': { full: '', masked: '' },
    'edit-phone': { full: '', masked: '' },
    'edit-id-number': { full: '', masked: '' },
    // 表格中的敏感信息存储：格式为 'table-phone-PAT001', 'table-id-PAT001'
};

// 脱敏处理函数
function maskPhone(phone) {
    if (!phone || phone.length !== 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
}

function maskIdNumber(idNumber) {
    if (!idNumber) return idNumber;
    // 显示前3位和后4位，中间用*代替
    if (idNumber.length === 18) {
        return idNumber.substring(0, 3) + '***********' + idNumber.substring(14);
    } else if (idNumber.length === 15) {
        return idNumber.substring(0, 3) + '********' + idNumber.substring(11);
    }
    // 如果长度不是15或18位，至少显示前3位和后4位（如果可能）
    if (idNumber.length > 7) {
        return idNumber.substring(0, 3) + '*'.repeat(idNumber.length - 7) + idNumber.substring(idNumber.length - 4);
    }
    return idNumber;
}

// 查看患者详情
function viewPatient(patientId) {
    currentPatientId = patientId;
    const patient = patientData[patientId];
    if (!patient) {
        alert('患者信息不存在');
        return;
    }

    // 切换到查看模式
    document.getElementById('patient-view-mode').style.display = 'block';
    document.getElementById('patient-edit-mode').style.display = 'none';
    document.getElementById('patient-view-buttons').style.display = 'flex';
    document.getElementById('patient-edit-buttons').style.display = 'none';

    // 填充基础个人信息（查看模式）
    document.getElementById('detail-name').textContent = patient.name;
    document.getElementById('detail-gender').textContent = patient.gender;
    document.getElementById('detail-birthdate').textContent = patient.birthdate;
    document.getElementById('detail-age').textContent = patient.age + '岁';
    
    // 手机号脱敏显示
    const maskedPhone = maskPhone(patient.phone);
    sensitiveInfoStore['detail-phone'] = { full: patient.phone, masked: maskedPhone };
    document.getElementById('detail-phone').textContent = maskedPhone;
    
    document.getElementById('detail-marital').textContent = patient.marital;

    // 填充身份与账户信息（查看模式）
    document.getElementById('detail-id-type').textContent = patient.idType;
    
    // 身份证号脱敏显示
    const maskedIdNumber = maskIdNumber(patient.idNumber);
    sensitiveInfoStore['detail-id-number'] = { full: patient.idNumber, masked: maskedIdNumber };
    document.getElementById('detail-id-number').textContent = maskedIdNumber;
    document.getElementById('detail-source').textContent = patient.source;
    document.getElementById('detail-company').textContent = patient.company;
    document.getElementById('detail-member-level').textContent = patient.memberLevel;
    document.getElementById('detail-pid').textContent = patient.pid;

    // 填充业务相关信息（查看模式）
    document.getElementById('detail-register-time').textContent = patient.registerTime;
    document.getElementById('detail-last-exam').textContent = patient.lastExam;
    document.getElementById('detail-exam-count').textContent = patient.examCount + '次';
    document.getElementById('detail-status').innerHTML = '<span class="status-badge active">' + patient.status + '</span>';

    // 填充扩展健康档案（查看模式）
    document.getElementById('detail-allergy').textContent = patient.allergy;
    document.getElementById('detail-history').textContent = patient.history;
    document.getElementById('detail-blood-type').textContent = patient.bloodType;
    document.getElementById('detail-height').textContent = patient.height;
    document.getElementById('detail-weight').textContent = patient.weight;

    // 填充编辑表单
    fillEditForm(patient);

    // 显示模态框
    document.getElementById('patient-detail-modal').classList.add('active');
}

// 填充编辑表单
function fillEditForm(patient) {
    document.getElementById('edit-name').value = patient.name;
    document.getElementById('edit-gender').value = patient.gender;
    document.getElementById('edit-birthdate').value = patient.birthdate;
    document.getElementById('edit-age').value = patient.age;
    
    // 编辑模式下也存储完整信息用于显示/隐藏
    const maskedPhone = maskPhone(patient.phone);
    sensitiveInfoStore['edit-phone'] = { full: patient.phone, masked: maskedPhone, visible: false };
    const editPhoneInput = document.getElementById('edit-phone');
    editPhoneInput.value = maskedPhone;
    editPhoneInput.type = 'text'; // 保持为text类型，通过value值来控制显示
    
    document.getElementById('edit-marital').value = patient.marital;
    document.getElementById('edit-id-type').value = patient.idType;
    
    // 身份证号脱敏显示
    const maskedIdNumber = maskIdNumber(patient.idNumber);
    sensitiveInfoStore['edit-id-number'] = { full: patient.idNumber, masked: maskedIdNumber, visible: false };
    const editIdNumberInput = document.getElementById('edit-id-number');
    editIdNumberInput.value = maskedIdNumber;
    editIdNumberInput.type = 'text'; // 保持为text类型，通过value值来控制显示
    document.getElementById('edit-source').value = patient.source;
    document.getElementById('edit-company').value = patient.company;
    document.getElementById('edit-member-level').value = patient.memberLevel;
    document.getElementById('edit-pid').value = patient.pid;
    document.getElementById('edit-register-time').value = patient.registerTime;
    document.getElementById('edit-last-exam').value = patient.lastExam;
    document.getElementById('edit-exam-count').value = patient.examCount + '次';
    document.getElementById('edit-status').value = patient.status;
    document.getElementById('edit-allergy').value = patient.allergy;
    document.getElementById('edit-history').value = patient.history;
    document.getElementById('edit-blood-type').value = patient.bloodType;
    document.getElementById('edit-height').value = patient.height.replace('cm', '') || '';
    document.getElementById('edit-weight').value = patient.weight.replace('kg', '') || '';
}

// 启用编辑模式
function enablePatientEdit() {
    document.getElementById('patient-view-mode').style.display = 'none';
    document.getElementById('patient-edit-mode').style.display = 'block';
    document.getElementById('patient-view-buttons').style.display = 'none';
    document.getElementById('patient-edit-buttons').style.display = 'flex';
    
    // 监听编辑模式下手机号和身份证号的输入变化
    const editPhoneInput = document.getElementById('edit-phone');
    const editIdNumberInput = document.getElementById('edit-id-number');
    
    if (editPhoneInput) {
        editPhoneInput.addEventListener('input', function() {
            // 如果用户输入了新的完整手机号，更新存储
            const value = this.value.trim();
            if (value.length === 11 && /^1[3-9]\d{9}$/.test(value)) {
                sensitiveInfoStore['edit-phone'].full = value;
                sensitiveInfoStore['edit-phone'].masked = maskPhone(value);
            }
        });
    }
    
    if (editIdNumberInput) {
        editIdNumberInput.addEventListener('input', function() {
            // 如果用户输入了新的完整身份证号，更新存储
            const value = this.value.trim();
            if (value.length === 18 || value.length === 15) {
                sensitiveInfoStore['edit-id-number'].full = value;
                sensitiveInfoStore['edit-id-number'].masked = maskIdNumber(value);
            }
        });
    }
}

// 取消编辑
function cancelPatientEdit() {
    if (!currentPatientId) return;
    
    // 重新加载患者数据到编辑表单
    const patient = patientData[currentPatientId];
    if (patient) {
        fillEditForm(patient);
    }
    
    // 切换回查看模式
    document.getElementById('patient-view-mode').style.display = 'block';
    document.getElementById('patient-edit-mode').style.display = 'none';
    document.getElementById('patient-view-buttons').style.display = 'flex';
    document.getElementById('patient-edit-buttons').style.display = 'none';
}

// 保存患者编辑
function savePatientEdit() {
    if (!currentPatientId) return;
    
    const form = document.getElementById('patient-edit-form');
    
    // 验证必填项
    const name = form['edit-name'].value.trim();
    const gender = form['edit-gender'].value;
    const age = form['edit-age'].value;
    
    // 获取手机号：如果当前显示的是脱敏值，使用存储的完整值
    let phone = form['edit-phone'].value.trim();
    const phoneInfo = sensitiveInfoStore['edit-phone'];
    if (phoneInfo && phone === phoneInfo.masked) {
        // 如果当前值是脱敏值，使用完整值
        phone = phoneInfo.full || phone;
    }
    
    // 获取身份证号：同样处理
    let idNumber = form['edit-id-number'].value.trim();
    const idInfo = sensitiveInfoStore['edit-id-number'];
    if (idInfo && idNumber === idInfo.masked) {
        // 如果当前值是脱敏值，使用完整值
        idNumber = idInfo.full || idNumber;
    }
    
    if (!name) {
        alert('请输入患者姓名');
        form['edit-name'].focus();
        return;
    }
    
    if (!gender) {
        alert('请选择性别');
        form['edit-gender'].focus();
        return;
    }
    
    if (!age || age <= 0) {
        alert('请输入有效的年龄');
        form['edit-age'].focus();
        return;
    }
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        alert('请输入有效的手机号（11位数字）');
        form['edit-phone'].focus();
        return;
    }
    
    if (!idNumber) {
        alert('请输入证件号码');
        form['edit-id-number'].focus();
        return;
    }
    
    // 更新患者数据
    const patient = patientData[currentPatientId];
    if (patient) {
        patient.name = name;
        patient.gender = gender;
        patient.birthdate = form['edit-birthdate'].value;
        patient.age = parseInt(age);
        patient.phone = phone;
        patient.marital = form['edit-marital'].value;
        patient.idType = form['edit-id-type'].value;
        patient.idNumber = idNumber;
        
        // 更新敏感信息存储
        sensitiveInfoStore['detail-phone'] = { full: phone, masked: maskPhone(phone) };
        sensitiveInfoStore['detail-id-number'] = { full: idNumber, masked: maskIdNumber(idNumber) };
        sensitiveInfoStore['edit-phone'] = { full: phone, masked: maskPhone(phone) };
        sensitiveInfoStore['edit-id-number'] = { full: idNumber, masked: maskIdNumber(idNumber) };
        patient.source = form['edit-source'].value;
        patient.company = form['edit-company'].value || '-';
        patient.memberLevel = form['edit-member-level'].value;
        patient.status = form['edit-status'].value;
        patient.allergy = form['edit-allergy'].value || '无';
        patient.history = form['edit-history'].value || '无';
        patient.bloodType = form['edit-blood-type'].value || '';
        patient.height = form['edit-height'].value ? form['edit-height'].value + 'cm' : '';
        patient.weight = form['edit-weight'].value ? form['edit-weight'].value + 'kg' : '';
    }
    
    console.log('保存患者编辑数据:', patient);
    
    // 这里可以添加实际的保存逻辑（API调用等）
    alert('患者信息保存成功！');
    
    // 重新加载查看模式显示更新后的数据
    viewPatient(currentPatientId);
}

// 切换敏感信息显示/隐藏
function toggleSensitiveInfo(type, mode) {
    let key, elementId;
    
    if (type === 'appointment-phone') {
        // 预约详情中的手机号
        key = 'appointment-phone';
        elementId = 'appointment-patient-phone';
    } else {
        // 患者详情中的手机号或身份证号
        key = mode + '-' + type;
        elementId = 'detail-' + type;
    }
    
    const info = sensitiveInfoStore[key];
    
    if (!info || !info.full) return;
    
    if (mode === 'detail' || type === 'appointment-phone') {
        // 查看模式：切换span内容
        const element = document.getElementById(elementId);
        const eyeIcon = event.target;
        
        if (element && element.textContent === info.masked) {
            // 显示完整信息
            element.textContent = info.full;
            eyeIcon.classList.add('active');
            eyeIcon.textContent = '👁️‍🗨️'; // 睁开的眼睛
        } else if (element) {
            // 显示脱敏信息
            element.textContent = info.masked;
            eyeIcon.classList.remove('active');
            eyeIcon.textContent = '👁️'; // 闭着的眼睛
        }
    } else if (mode === 'edit') {
        // 编辑模式：切换input的value值
        const input = document.getElementById('edit-' + type);
        const eyeIcon = event.target;
        
        if (!input) return;
        
        // 判断当前显示的是脱敏值还是完整值
        const isMasked = input.value === info.masked || (!info.visible && input.value.length <= info.masked.length);
        
        if (isMasked || !info.visible) {
            // 当前显示脱敏值，切换到完整值
            input.value = info.full;
            info.visible = true;
            eyeIcon.classList.add('active');
            eyeIcon.textContent = '👁️‍🗨️';
        } else {
            // 当前显示完整值，切换到脱敏值
            // 如果用户修改了值，先保存
            if (input.value !== info.full && input.value.length === (type === 'phone' ? 11 : info.full.length)) {
                info.full = input.value;
                info.masked = type === 'phone' ? maskPhone(input.value) : maskIdNumber(input.value);
            }
            input.value = info.masked;
            info.visible = false;
            eyeIcon.classList.remove('active');
            eyeIcon.textContent = '👁️';
        }
    }
}

// 关闭患者详情模态框
function closePatientDetailModal() {
    document.getElementById('patient-detail-modal').classList.remove('active');
    // 重置为查看模式
    document.getElementById('patient-view-mode').style.display = 'block';
    document.getElementById('patient-edit-mode').style.display = 'none';
    document.getElementById('patient-view-buttons').style.display = 'flex';
    document.getElementById('patient-edit-buttons').style.display = 'none';
    currentPatientId = null;
    
    // 重置敏感信息显示状态
    const detailPhone = document.getElementById('detail-phone');
    const detailIdNumber = document.getElementById('detail-id-number');
    if (detailPhone && sensitiveInfoStore['detail-phone'].masked) {
        detailPhone.textContent = sensitiveInfoStore['detail-phone'].masked;
    }
    if (detailIdNumber && sensitiveInfoStore['detail-id-number'].masked) {
        detailIdNumber.textContent = sensitiveInfoStore['detail-id-number'].masked;
    }
}

// 从身份证号提取生日
function extractBirthdateFromId(idNumber) {
    if (!idNumber) return null;
    
    // 18位身份证号：前6位地区码，第7-14位为出生日期（YYYYMMDD）
    // 15位身份证号：前6位地区码，第7-12位为出生日期（YYMMDD，年份为19XX）
    if (idNumber.length === 18) {
        const year = idNumber.substring(6, 10);
        const month = idNumber.substring(10, 12);
        const day = idNumber.substring(12, 14);
        return `${year}-${month}-${day}`;
    } else if (idNumber.length === 15) {
        const year = '19' + idNumber.substring(6, 8);
        const month = idNumber.substring(8, 10);
        const day = idNumber.substring(10, 12);
        return `${year}-${month}-${day}`;
    }
    return null;
}

// 从生日计算年龄
function calculateAgeFromBirthdate(birthdate) {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// 显示新增患者模态框
function showAddPatientModal() {
    document.getElementById('add-patient-modal').classList.add('active');
    // 重置表单
    document.getElementById('patient-form').reset();
}

// 关闭新增患者模态框
function closeAddPatientModal() {
    document.getElementById('add-patient-modal').classList.remove('active');
    
    // 如果是从预约页面打开的，不需要做任何操作，预约弹窗应该还在
    // 只需要重置标记即可
    if (isFromAppointment) {
        isFromAppointment = false;
    }
}

// 保存患者
function savePatient() {
    const form = document.getElementById('patient-form');
    
    // 验证必填项
    const name = form.name.value.trim();
    const gender = form.gender.value;
    const age = form.age.value;
    const phone = form.phone.value.trim();
    const idNumber = form.idNumber.value.trim();
    
    if (!name) {
        alert('请输入患者姓名');
        form.name.focus();
        return;
    }
    
    if (!gender) {
        alert('请选择性别');
        form.gender.focus();
        return;
    }
    
    if (!age || age <= 0) {
        alert('请输入有效的年龄');
        form.age.focus();
        return;
    }
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        alert('请输入有效的手机号（11位数字）');
        form.phone.focus();
        return;
    }
    
    if (!idNumber) {
        alert('请输入证件号码');
        form.idNumber.focus();
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(form);
    const patientData = {
        name: name,
        gender: gender,
        birthdate: formData.get('birthdate') || '',
        age: parseInt(age),
        phone: phone,
        marital: formData.get('marital') || '',
        idType: formData.get('idType') || '身份证',
        idNumber: idNumber,
        source: formData.get('source') || '个人体检',
        company: formData.get('company') || '-',
        memberLevel: formData.get('memberLevel') || '普通会员',
        status: formData.get('status') || '正常',
        allergy: formData.get('allergy') || '无',
        history: formData.get('history') || '无',
        bloodType: formData.get('bloodType') || '',
        height: formData.get('height') || '',
        weight: formData.get('weight') || '',
        registerTime: new Date().toLocaleString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace(/\//g, '-'),
        lastExam: '-',
        examCount: 0,
        pid: 'PAT' + String(Date.now()).slice(-6) // 生成唯一ID
    };
    
    console.log('保存患者数据:', patientData);
    
    // 保存到患者数据（实际项目中应该调用API）
    const patientId = patientData.pid;
    // 保存到全局patientData对象（注意：局部变量名也是patientData，所以需要区分）
    const newPatient = {
        name: patientData.name,
        gender: patientData.gender,
        birthdate: patientData.birthdate,
        age: patientData.age,
        phone: patientData.phone,
        marital: patientData.marital,
        idType: patientData.idType,
        idNumber: patientData.idNumber,
        source: patientData.source,
        company: patientData.company,
        memberLevel: patientData.memberLevel,
        pid: patientId,
        registerTime: patientData.registerTime,
        lastExam: patientData.lastExam,
        examCount: patientData.examCount,
        status: patientData.status,
        allergy: patientData.allergy,
        history: patientData.history,
        bloodType: patientData.bloodType,
        height: patientData.height,
        weight: patientData.weight
    };
    
    // 保存到全局patientData对象
    patientData[patientId] = newPatient;
    
    // 如果是从预约页面打开的，关闭新增患者弹窗，刷新患者列表，并选中新患者
    if (isFromAppointment) {
        isFromAppointment = false;
        document.getElementById('add-patient-modal').classList.remove('active');
        // 刷新预约弹窗中的患者列表
        loadPatientList();
        // 选中新创建的患者
        setTimeout(() => {
            selectPatient(patientId, newPatient);
        }, 100);
    } else {
        alert('患者信息保存成功！\n患者ID: ' + patientId);
        closeAddPatientModal();
    }
    
    // 实际项目中，这里应该刷新患者列表
    // refreshPatientList();
}

// 所有体检科室列表
const allDepartments = ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '妇科', '彩超', '心电图', '经颅多普勒', '检验科', '碳14'];

// 套餐数据
const packageData = {
    'PKG001': {
        id: 'PKG001',
        name: '基础体检套餐',
        gender: '通用',
        departments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '彩超'],
        examItems: [
            { department: '一般检查', category: '基础体征', examItem: '身高体重', subItem: '身高' },
            { department: '一般检查', category: '基础体征', examItem: '身高体重', subItem: '体重' },
            { department: '一般检查', category: '基础体征', examItem: '血压', subItem: '收缩压' },
            { department: '物理检查', category: '内科检查', examItem: '心肺听诊', subItem: '心率' },
            { department: '实验室检查', category: '生化检查', examItem: '肝功九项', subItem: '[ALT]谷丙转氨酶' },
            { department: '实验室检查', category: '生化检查', examItem: '肾功三项', subItem: '[Urea]尿素' }
        ],
        status: '启用'
    },
    'PKG002': {
        id: 'PKG002',
        name: '女性专属套餐',
        gender: '女性',
        departments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '妇科', '彩超', '心电图', '检验科'],
        examItems: [
            { department: '一般检查', category: '基础体征', examItem: '身高体重', subItem: '身高' },
            { department: '一般检查', category: '基础体征', examItem: '血压', subItem: '舒张压' },
            { department: '实验室检查', category: '生化检查', examItem: '肝功九项', subItem: '[AST]谷草转氨酶' },
            { department: '实验室检查', category: '生化检查', examItem: '血脂四项', subItem: '[TG]甘油三酯' },
            { department: '超声检查', category: '腹部超声', examItem: '肝胆胰脾肾彩超', subItem: '超声所见' },
            { department: '心电图', category: '心电图检查', examItem: '十二导联心电图', subItem: '心电图结论' }
        ],
        status: '启用'
    },
    'PKG003': {
        id: 'PKG003',
        name: '男性专属套餐',
        gender: '男性',
        departments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '彩超', '心电图', '检验科'],
        examItems: [
            { department: '一般检查', category: '基础体征', examItem: '血压', subItem: '收缩压' },
            { department: '实验室检查', category: '生化检查', examItem: '肝功九项', subItem: '[GGT]谷氨酰转移酶' },
            { department: '实验室检查', category: '生化检查', examItem: '心肌酶四项', subItem: '[CK]肌酸激酶' },
            { department: '影像检查', category: '放射检查', examItem: '胸部正位片', subItem: '影像诊断' },
            { department: '内镜检查', category: '胃肠镜检查', examItem: '碳13呼气试验', subItem: '幽门螺杆菌' }
        ],
        status: '启用'
    }
};

// 预约数据（模拟数据；appointmentTime 在列表中展示为上午/下午）
const appointmentData = {
    'APT202603251556365421': {
        appointmentId: 'APT202603251556365421',
        appointmentDate: '2026-03-27',
        appointmentTime: '上午',
        timeRange: '09:00-10:00',
        timeSlot: '上午',
        status: '已预约',
        patientId: 'PAT004',
        packageName: '全亚VIP套餐 (970)',
        packageDepartments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '彩超'],
        optionalDepartments: ['心电图', '经颅多普勒']
    },
    'APT202603251556365422': {
        appointmentId: 'APT202603251556365422',
        appointmentDate: '2026-03-27',
        appointmentTime: '下午',
        timeRange: '14:00-15:00',
        timeSlot: '下午',
        status: '已取消',
        patientId: 'PAT005',
        packageName: '基础体检套餐',
        packageDepartments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '彩超'],
        optionalDepartments: []
    },
    'APT20240401001': {
        appointmentId: 'APT20240401001',
        appointmentDate: '2024-04-01',
        appointmentTime: '上午',
        timeRange: '09:00-10:00',
        timeSlot: '上午',
        status: '已签到',
        patientId: 'PAT001',
        packageName: '基础体检套餐',
        packageDepartments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '彩超'],
        optionalDepartments: ['妇科', '心电图', '经颅多普勒']
    },
    'APT20240402002': {
        appointmentId: 'APT20240402002',
        appointmentDate: '2024-04-02',
        appointmentTime: '下午',
        timeRange: '14:00-15:00',
        timeSlot: '下午',
        status: '已预约',
        patientId: 'PAT002',
        packageName: '女性专属套餐',
        packageDepartments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '妇科', '彩超', '心电图', '检验科'],
        optionalDepartments: ['经颅多普勒', '碳14']
    },
    'APT20240403003': {
        appointmentId: 'APT20240403003',
        appointmentDate: '2024-04-03',
        appointmentTime: '上午',
        timeRange: '10:00-11:00',
        timeSlot: '上午',
        status: '已预约',
        patientId: 'PAT003',
        packageName: '男性专属套餐',
        packageDepartments: ['内科', '外科', '眼耳鼻咽喉科', '口腔科', '彩超', '心电图', '检验科'],
        optionalDepartments: []
    }
};

// 查看预约详情
function viewAppointment(appointmentId) {
    const appointment = appointmentData[appointmentId];
    if (!appointment) {
        alert('预约信息不存在');
        return;
    }

    // 获取患者信息
    const patient = patientData[appointment.patientId];
    if (!patient) {
        alert('患者信息不存在');
        return;
    }

    // 填充预约信息
    document.getElementById('appointment-id').textContent = appointment.appointmentId;
    document.getElementById('appointment-date').textContent = appointment.appointmentDate;
    document.getElementById('appointment-time').textContent = appointment.appointmentTime;

    // 填充用户基本信息
    document.getElementById('appointment-patient-name').textContent = patient.name;
    document.getElementById('appointment-patient-gender').textContent = patient.gender;
    document.getElementById('appointment-patient-age').textContent = patient.age + '岁';
    
    // 手机号脱敏显示
    const maskedPhone = maskPhone(patient.phone);
    sensitiveInfoStore['appointment-phone'] = { full: patient.phone, masked: maskedPhone };
    document.getElementById('appointment-patient-phone').textContent = maskedPhone;

    // 填充套餐信息
    document.getElementById('appointment-package-name').textContent = appointment.packageName;
    
    // 显示套餐包含的科室
    const packageDepartmentsContainer = document.getElementById('appointment-package-departments');
    packageDepartmentsContainer.innerHTML = '';
    if (appointment.packageDepartments && appointment.packageDepartments.length > 0) {
        appointment.packageDepartments.forEach(dept => {
            const tag = document.createElement('span');
            tag.className = 'department-tag';
            tag.textContent = dept;
            packageDepartmentsContainer.appendChild(tag);
        });
    } else {
        const emptyTag = document.createElement('span');
        emptyTag.className = 'department-tag empty';
        emptyTag.textContent = '无';
        packageDepartmentsContainer.appendChild(emptyTag);
    }

    // 显示患者选择的套餐外体检项
    const optionalDepartmentsContainer = document.getElementById('appointment-optional-departments');
    optionalDepartmentsContainer.innerHTML = '';
    if (appointment.optionalDepartments && appointment.optionalDepartments.length > 0) {
        appointment.optionalDepartments.forEach(dept => {
            const tag = document.createElement('span');
            tag.className = 'department-tag';
            tag.textContent = dept;
            optionalDepartmentsContainer.appendChild(tag);
        });
    } else {
        const emptyTag = document.createElement('span');
        emptyTag.className = 'department-tag empty';
        emptyTag.textContent = '无';
        optionalDepartmentsContainer.appendChild(emptyTag);
    }

    // 设置当前预约ID
    currentAppointmentId = appointmentId;
    
    // 确保是查看模式
    document.getElementById('appointment-view-mode').style.display = 'block';
    document.getElementById('appointment-edit-mode').style.display = 'none';
    document.getElementById('appointment-view-buttons').style.display = 'flex';
    document.getElementById('appointment-edit-buttons').style.display = 'none';
    
    // 显示模态框
    document.getElementById('appointment-detail-modal').classList.add('active');
}

// 当前编辑的预约ID
let currentAppointmentId = null;

// 关闭预约详情模态框
function closeAppointmentDetailModal() {
    document.getElementById('appointment-detail-modal').classList.remove('active');
    // 重置为查看模式
    document.getElementById('appointment-view-mode').style.display = 'block';
    document.getElementById('appointment-edit-mode').style.display = 'none';
    document.getElementById('appointment-view-buttons').style.display = 'flex';
    document.getElementById('appointment-edit-buttons').style.display = 'none';
    currentAppointmentId = null;
}

// 编辑预约
function editAppointment() {
    if (!currentAppointmentId) {
        // 从查看模式切换到编辑模式
        const appointmentId = document.getElementById('appointment-id').textContent;
        if (!appointmentId || appointmentId === '-') return;
        currentAppointmentId = appointmentId;
    }
    
    const appointment = appointmentData[currentAppointmentId];
    if (!appointment) {
        alert('预约信息不存在');
        return;
    }
    
    // 切换到编辑模式
    document.getElementById('appointment-view-mode').style.display = 'none';
    document.getElementById('appointment-edit-mode').style.display = 'block';
    document.getElementById('appointment-view-buttons').style.display = 'none';
    document.getElementById('appointment-edit-buttons').style.display = 'flex';
    
    // 填充编辑表单
    fillAppointmentEditForm(appointment);
}

// 填充预约编辑表单
function fillAppointmentEditForm(appointment) {
    // 填充预约信息
    document.getElementById('appointment-edit-id').textContent = appointment.appointmentId;
    document.getElementById('appointment-edit-date').value = appointment.appointmentDate;
    document.getElementById('appointment-edit-time').value = appointment.timeRange || appointment.appointmentTime;
    
    // 获取患者信息
    const patient = patientData[appointment.patientId];
    if (patient) {
        document.getElementById('appointment-edit-patient-name').textContent = patient.name;
        document.getElementById('appointment-edit-patient-gender').textContent = patient.gender;
        document.getElementById('appointment-edit-patient-age').textContent = patient.age + '岁';
        
        // 手机号脱敏显示
        const maskedPhone = maskPhone(patient.phone);
        document.getElementById('appointment-edit-patient-phone').textContent = maskedPhone;
    }
    
    // 加载套餐列表到下拉框
    const packageSelect = document.getElementById('appointment-edit-package');
    packageSelect.innerHTML = '<option value="">请选择套餐</option>';
    
    let selectedPackageId = null;
    Object.keys(packageData).forEach(pkgId => {
        const pkg = packageData[pkgId];
        if (pkg.status === '启用') {
            const option = document.createElement('option');
            option.value = pkgId;
            option.textContent = `${pkg.name} (${pkg.gender})`;
            option.dataset.departments = JSON.stringify(pkg.departments);
            // 如果当前套餐匹配，设为选中
            if (pkg.name === appointment.packageName) {
                option.selected = true;
                selectedPackageId = pkgId;
            }
            packageSelect.appendChild(option);
        }
    });
    
    // 显示套餐包含的科室和可选套餐外体检项
    onAppointmentPackageChange();
    
    // 显示已选择的套餐外体检项（需要等待onAppointmentPackageChange执行完成）
    setTimeout(() => {
        if (appointment.optionalDepartments && appointment.optionalDepartments.length > 0) {
            appointment.optionalDepartments.forEach(dept => {
                const checkbox = document.querySelector(`#appointment-edit-optional-departments input[value="${dept}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }, 200);
}

// 预约编辑模式下套餐选择变化
function onAppointmentPackageChange() {
    const select = document.getElementById('appointment-edit-package');
    const selectedOption = select.options[select.selectedIndex];
    
    // 显示套餐包含的检查项
    const packageDepartmentsContainer = document.getElementById('appointment-edit-package-departments');
    packageDepartmentsContainer.innerHTML = '';
    
    if (selectedOption.value) {
        const departments = JSON.parse(selectedOption.dataset.departments || '[]');
        departments.forEach(dept => {
            const tag = document.createElement('span');
            tag.className = 'department-tag';
            tag.textContent = dept;
            packageDepartmentsContainer.appendChild(tag);
        });
        
        // 显示可选套餐外检查项（所有科室减去套餐中的科室）
        const optionalDepartments = allDepartments.filter(dept => !departments.includes(dept));
        displayAppointmentOptionalDepartments(optionalDepartments);
    } else {
        packageDepartmentsContainer.innerHTML = '';
        document.getElementById('appointment-edit-optional-departments').innerHTML = '';
    }
}

// 显示预约编辑模式下的可选套餐外检查项
function displayAppointmentOptionalDepartments(departments) {
    const container = document.getElementById('appointment-edit-optional-departments');
    container.innerHTML = '';
    
    if (departments.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = '无可选套餐外检查项';
        emptyMsg.style.color = '#999';
        emptyMsg.style.padding = '10px';
        container.appendChild(emptyMsg);
        return;
    }
    
    departments.forEach(dept => {
        const item = document.createElement('div');
        item.className = 'department-checkbox-item';
        const checkboxId = 'appointment-edit-opt-dept-' + dept;
        item.innerHTML = `
            <input type="checkbox" id="${checkboxId}" name="appointmentOptionalDepartments" value="${dept}">
            <label for="${checkboxId}">${dept}</label>
        `;
        container.appendChild(item);
    });
}

// 取消编辑预约
function cancelEditAppointment() {
    // 切换回查看模式
    document.getElementById('appointment-view-mode').style.display = 'block';
    document.getElementById('appointment-edit-mode').style.display = 'none';
    document.getElementById('appointment-view-buttons').style.display = 'flex';
    document.getElementById('appointment-edit-buttons').style.display = 'none';
    
    // 重新加载查看模式的数据
    if (currentAppointmentId) {
        viewAppointment(currentAppointmentId);
    }
}

// 保存预约编辑
function saveAppointmentEdit() {
    if (!currentAppointmentId) {
        alert('预约信息不存在');
        return;
    }
    
    const appointment = appointmentData[currentAppointmentId];
    if (!appointment) {
        alert('预约信息不存在');
        return;
    }
    
    const form = document.getElementById('appointment-edit-form');
    const formData = new FormData(form);
    
    // 获取编辑后的数据
    const appointmentDate = document.getElementById('appointment-edit-date').value;
    const appointmentTime = document.getElementById('appointment-edit-time').value;
    const packageSelect = document.getElementById('appointment-edit-package');
    const packageId = packageSelect.value;
    
    // 验证必填项
    if (!appointmentDate) {
        alert('请选择预约日期');
        document.getElementById('appointment-edit-date').focus();
        return;
    }
    
    if (!appointmentTime) {
        alert('请选择预约时间');
        document.getElementById('appointment-edit-time').focus();
        return;
    }
    
    if (!packageId) {
        alert('请选择套餐');
        packageSelect.focus();
        return;
    }
    
    // 获取选中的套餐外检查项
    const selectedOptionalDepartments = [];
    document.querySelectorAll('#appointment-edit-optional-departments input[type="checkbox"]:checked').forEach(checkbox => {
        selectedOptionalDepartments.push(checkbox.value);
    });
    
    // 获取套餐信息
    const selectedPackage = packageData[packageId];
    if (!selectedPackage) {
        alert('套餐信息不存在');
        return;
    }
    
    // 更新预约数据
    appointment.appointmentDate = appointmentDate;
    appointment.timeRange = appointmentTime;
    var editHour = parseInt(String(appointmentTime).split(':')[0], 10);
    var slotLabel = !isNaN(editHour) && editHour >= 12 ? '下午' : '上午';
    appointment.appointmentTime = slotLabel;
    appointment.timeSlot = slotLabel;
    appointment.packageName = selectedPackage.name;
    appointment.packageDepartments = selectedPackage.departments || [];
    appointment.optionalDepartments = selectedOptionalDepartments;
    
    console.log('保存预约编辑数据:', appointment);
    
    // 这里可以添加实际的保存逻辑（API调用等）
    alert('预约信息保存成功！');
    
    // 切换回查看模式并刷新数据
    document.getElementById('appointment-view-mode').style.display = 'block';
    document.getElementById('appointment-edit-mode').style.display = 'none';
    document.getElementById('appointment-view-buttons').style.display = 'flex';
    document.getElementById('appointment-edit-buttons').style.display = 'none';
    
    // 重新加载查看模式的数据
    viewAppointment(currentAppointmentId);
}

// 显示新增预约模态框
function showAddAppointmentModal() {
    document.getElementById('add-appointment-modal').classList.add('active');
    // 重置表单
    document.getElementById('appointment-form').reset();
    clearSelectedPatient();
    
    // 加载患者列表到下拉框
    loadPatientList();
    
    // 加载套餐列表
    loadPackageList();
    
    // 清空套餐外检查项
    document.getElementById('optional-departments-list').innerHTML = '';
    document.getElementById('package-departments-display').innerHTML = '';
}

// 关闭新增预约模态框
function closeAddAppointmentModal() {
    document.getElementById('add-appointment-modal').classList.remove('active');
}

// 加载患者列表表格
function loadPatientTable() {
    const tbody = document.getElementById('patient-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.keys(patientData).forEach(patientId => {
        const patient = patientData[patientId];
        const maskedPhone = maskPhone(patient.phone);
        const maskedIdNumber = maskIdNumber(patient.idNumber);
        
        // 存储完整和脱敏信息
        sensitiveInfoStore[`table-phone-${patientId}`] = { full: patient.phone, masked: maskedPhone, visible: false };
        sensitiveInfoStore[`table-id-${patientId}`] = { full: patient.idNumber, masked: maskedIdNumber, visible: false };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.pid || patientId}</td>
            <td>${patient.name}</td>
            <td>${patient.gender}</td>
            <td>${patient.age}</td>
            <td>
                <span class="sensitive-info">
                    <span id="table-phone-${patientId}">${maskedPhone}</span>
                    <span class="eye-icon" onclick="toggleTableSensitiveInfo('phone', '${patientId}')" title="点击查看完整信息">👁️</span>
                </span>
            </td>
            <td>
                <span class="sensitive-info">
                    <span id="table-id-${patientId}">${maskedIdNumber}</span>
                    <span class="eye-icon" onclick="toggleTableSensitiveInfo('id', '${patientId}')" title="点击查看完整信息">👁️</span>
                </span>
            </td>
            <td>${patient.registerTime ? patient.registerTime.split(' ')[0] : '-'}</td>
            <td>${patient.examCount || 0}</td>
            <td>${patient.lastExam || '-'}</td>
            <td>
                <button class="btn btn-sm btn-view" onclick="viewPatient('${patientId}')">查看</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 切换表格中敏感信息的显示/隐藏
function toggleTableSensitiveInfo(type, patientId) {
    const key = `table-${type}-${patientId}`;
    const info = sensitiveInfoStore[key];
    if (!info) return;
    
    const elementId = `table-${type}-${patientId}`;
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // 切换可见状态
    info.visible = !info.visible;
    
    // 根据状态显示完整或脱敏信息
    element.textContent = info.visible ? info.full : info.masked;
}

// 加载患者列表（用于下拉选择）
function loadPatientList() {
    const patientListContainer = document.getElementById('patient-list');
    patientListContainer.innerHTML = '';
    
    Object.keys(patientData).forEach(patientId => {
        const patient = patientData[patientId];
        const item = document.createElement('div');
        item.className = 'patient-dropdown-item';
        item.innerHTML = `
            <div class="patient-name">${patient.name}</div>
            <div class="patient-info">${patient.gender} | ${patient.age}岁 | ${maskPhone(patient.phone)}</div>
        `;
        item.onclick = function() {
            selectPatient(patientId, patient);
        };
        patientListContainer.appendChild(item);
    });
}

// 筛选患者
function filterPatients(searchText) {
    const patientListContainer = document.getElementById('patient-list');
    const items = patientListContainer.querySelectorAll('.patient-dropdown-item');
    const searchLower = searchText.toLowerCase();
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchLower) ? 'block' : 'none';
    });
    
    if (searchText) {
        showPatientDropdown();
    }
}

// 显示患者下拉框
function showPatientDropdown() {
    document.getElementById('patient-dropdown').style.display = 'block';
}

// 隐藏患者下拉框
function hidePatientDropdown() {
    setTimeout(() => {
        document.getElementById('patient-dropdown').style.display = 'none';
    }, 200);
}

// 选择患者
function selectPatient(patientId, patient) {
    document.getElementById('selected-patient-id').value = patientId;
    document.getElementById('selected-patient-name').textContent = `${patient.name} (${patient.gender}, ${patient.age}岁)`;
    document.getElementById('selected-patient-info').style.display = 'flex';
    document.getElementById('patient-search-input').value = '';
    hidePatientDropdown();
}

// 清除选择的患者
function clearSelectedPatient() {
    document.getElementById('selected-patient-id').value = '';
    document.getElementById('selected-patient-info').style.display = 'none';
    document.getElementById('patient-search-input').value = '';
}

// 从预约弹窗打开新建患者
function showAddPatientModalFromAppointment() {
    // 不关闭预约弹窗，直接打开新增患者弹窗（弹窗会叠加显示）
    showAddPatientModal(true); // 传入true表示从预约页面打开
}

// 加载套餐列表
function loadPackageList() {
    const select = document.getElementById('appointment-package-select');
    // 清空现有选项（保留第一个"请选择套餐"）
    select.innerHTML = '<option value="">请选择套餐</option>';
    
    Object.keys(packageData).forEach(pkgId => {
        const pkg = packageData[pkgId];
        if (pkg.status === '启用') {
            const option = document.createElement('option');
            option.value = pkgId;
            option.textContent = `${pkg.name} (${pkg.gender})`;
            option.dataset.departments = JSON.stringify(pkg.departments);
            select.appendChild(option);
        }
    });
}

// 套餐选择变化
function onPackageChange() {
    const select = document.getElementById('appointment-package-select');
    const selectedOption = select.options[select.selectedIndex];
    
    // 显示套餐包含的检查项
    const packageDepartmentsContainer = document.getElementById('package-departments-display');
    packageDepartmentsContainer.innerHTML = '';
    
    if (selectedOption.value) {
        const departments = JSON.parse(selectedOption.dataset.departments || '[]');
        departments.forEach(dept => {
            const tag = document.createElement('span');
            tag.className = 'department-tag';
            tag.textContent = dept;
            packageDepartmentsContainer.appendChild(tag);
        });
        
        // 显示可选套餐外检查项（所有科室减去套餐中的科室）
        const optionalDepartments = allDepartments.filter(dept => !departments.includes(dept));
        displayOptionalDepartments(optionalDepartments);
    } else {
        packageDepartmentsContainer.innerHTML = '';
        document.getElementById('optional-departments-list').innerHTML = '';
    }
}

// 显示可选套餐外检查项
function displayOptionalDepartments(departments) {
    const container = document.getElementById('optional-departments-list');
    container.innerHTML = '';
    
    if (departments.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = '无可选套餐外检查项';
        emptyMsg.style.color = '#999';
        emptyMsg.style.padding = '10px';
        container.appendChild(emptyMsg);
        return;
    }
    
    departments.forEach(dept => {
        const item = document.createElement('div');
        item.className = 'department-checkbox-item';
        const checkboxId = 'opt-dept-' + dept;
        item.innerHTML = `
            <input type="checkbox" id="${checkboxId}" name="optionalDepartments" value="${dept}">
            <label for="${checkboxId}">${dept}</label>
        `;
        container.appendChild(item);
    });
}

// 保存预约
function saveAppointment() {
    const form = document.getElementById('appointment-form');
    const formData = new FormData(form);
    
    // 验证必填项
    const patientId = document.getElementById('selected-patient-id').value;
    const packageId = formData.get('packageId');
    const appointmentDate = formData.get('appointmentDate');
    const appointmentTime = formData.get('appointmentTime');
    
    if (!patientId) {
        alert('请选择患者');
        return;
    }
    
    if (!packageId) {
        alert('请选择套餐');
        form['packageId'].focus();
        return;
    }
    
    if (!appointmentDate) {
        alert('请选择预约日期');
        document.getElementById('appointment-date').focus();
        return;
    }
    
    if (!appointmentTime) {
        alert('请选择预约时间');
        document.getElementById('appointment-time').focus();
        return;
    }
    
    // 获取选中的套餐外检查项
    const selectedOptionalDepartments = [];
    document.querySelectorAll('#optional-departments-list input[type="checkbox"]:checked').forEach(checkbox => {
        selectedOptionalDepartments.push(checkbox.value);
    });
    
    // 获取套餐信息
    const selectedPackage = packageData[packageId];
    const patient = patientData[patientId];
    
    // 生成预约编号
    const appointmentId = 'APT' + new Date().getTime().toString().slice(-11);
    
    var timeSlotLabel = '上午';
    var hour = parseInt(String(appointmentTime).split(':')[0], 10);
    if (!isNaN(hour) && hour >= 12) {
        timeSlotLabel = '下午';
    }
    
    // 创建预约数据
    const appointment = {
        appointmentId: appointmentId,
        appointmentDate: appointmentDate,
        appointmentTime: timeSlotLabel,
        timeRange: appointmentTime,
        timeSlot: timeSlotLabel,
        status: '已预约',
        patientId: patientId,
        packageName: selectedPackage.name,
        packageDepartments: selectedPackage.departments,
        optionalDepartments: selectedOptionalDepartments
    };
    
    // 保存到预约数据（实际项目中应该调用API）
    appointmentData[appointmentId] = appointment;
    
    console.log('保存预约数据:', appointment);
    
    alert('预约创建成功！\n预约编号: ' + appointmentId);
    closeAddAppointmentModal();
    
    // 实际项目中，这里应该刷新预约列表
    // refreshAppointmentList();
}

// 体检数据存储（键为「新增套餐」中的第二级：检查类别）
const examinationData = {
    'EXAM20240315001': {
        '一般检查': {
            status: '已录入',
            height: 175,
            weight: 72,
            bloodPressure: '118/76',
            pulseRate: 72,
            doctorSummary: '身高体重指数正常，血压、脉率未见明显异常。',
            chiefDoctor: '张医生',
            recorder: '管理员',
            images: []
        },
        '物理检查': {
            status: '待录入'
        },
        '常规检查': {
            status: 'AI解析中'
        }
    },
    'EXAM20240320002': {
        '生化检查': {
            status: 'AI解析完成',
            heartRate: 75,
            heartRhythm: '齐',
            heartMurmur: '无',
            lungAuscultation: '双肺呼吸音清，未闻及干湿性啰音',
            liverSpleen: '肋下未触及',
            medicalHistory: '无特殊病史',
            doctorSummary: '心率正常，心律齐，无杂音，肺部听诊正常，肝脾未触及。',
            aiResult: '根据AI分析，心电图显示窦性心律，心率75次/分，节律规整。心电波形正常，无明显异常。',
            aiSuggestion: '建议：1. 继续保持良好的生活习惯；2. 定期复查心电图；3. 如有不适及时就医。',
            images: []
        },
        '免疫/感染': {
            status: '已录入',
            doctorSummary: '乙肝表面抗原阴性，丙肝抗体阴性。',
            chiefDoctor: '王医生',
            recorder: '管理员',
            images: []
        }
    },
    'EXAM20240325003': {
        '影像检查': {
            status: '已录入',
            doctorSummary: '经颅多普勒血流频谱形态未见明显异常。',
            chiefDoctor: '李医生',
            recorder: '管理员',
            images: []
        },
        '专项检查': {
            status: 'AI解析完成',
            height: 175,
            weight: 72,
            skinMucosa: '皮肤粘膜检查未见异常，无皮疹、色素沉着',
            spineLimbs: '脊柱四肢检查正常，无畸形，活动自如',
            thyroid: '甲状腺检查未见异常，无肿大',
            lymphNodes: '浅表淋巴结检查未见异常',
            joints: '关节检查正常，无红肿、压痛',
            medicalHistory: '无特殊病史',
            aiResult: '幽门螺旋杆菌呼气试验：阴性。AI分析未见明显异常。',
            aiSuggestion: '建议：1. 保持饮食卫生；2. 定期复查；3. 如有胃部不适及时就医。',
            images: []
        }
    }
};

// 当前查看的体检信息
let currentExaminationInfo = {
    examId: null,
    department: null,
    patientName: null
};

// 当前编辑的图片列表
let currentImages = [];

// 录入（与查看进入同一详情，便于后续区分「仅录入」流程）
function enterExamination(examId, category, evt) {
    viewExamination(examId, category, evt);
}

// 查看体检记录（department 为套餐「检查类别」第二级分类）
function viewExamination(examId, department, evt) {
    currentExaminationInfo.examId = examId;
    currentExaminationInfo.department = department;
    
    var triggerEvt = evt;
    if (triggerEvt === undefined && typeof event !== 'undefined') {
        triggerEvt = event;
    }
    
    // 获取患者信息（从表格中获取）
    let patientName = '';
    try {
        if (triggerEvt && triggerEvt.target) {
            const row = triggerEvt.target.closest('tr');
            if (row) {
                patientName = row.cells[2].textContent.trim();
            }
        }
    } catch (e) {
        patientName = '患者';
    }
    
    // 如果还是空的，尝试从预约数据获取
    if (!patientName) {
        // 这里可以根据examId查找对应的患者信息
        patientName = '患者';
    }
    
    currentExaminationInfo.patientName = patientName;
    
    // 获取体检数据
    const examData = examinationData[examId];
    const deptData = examData && examData[department] ? examData[department] : null;
    const status = deptData && deptData.status ? deptData.status : '待录入';
    
    // 填充基本信息
    document.getElementById('im-exam-id').textContent = examId;
    document.getElementById('im-patient-name').textContent = patientName;
    document.getElementById('im-department').textContent = department;
    // 根据状态显示状态徽章
    let statusBadge = '';
    if (status === '已录入') {
        statusBadge = '<span class="status-badge completed">已录入</span>';
    } else if (status === 'AI解析中') {
        statusBadge = '<span class="status-badge ai-parsing">AI解析中</span>';
    } else if (status === 'AI解析完成') {
        statusBadge = '<span class="status-badge ai-completed">AI解析完成</span>';
    } else {
        statusBadge = '<span class="status-badge pending">待录入</span>';
    }
    document.getElementById('im-status').innerHTML = statusBadge;
    
    // 填充主检医生和信息录入员（查看模式）
    const chiefDoctor = deptData && deptData.chiefDoctor ? deptData.chiefDoctor : '';
    const recorder = deptData && deptData.recorder ? deptData.recorder : getCurrentUser();
    document.getElementById('im-chief-doctor').textContent = chiefDoctor;
    document.getElementById('im-recorder').textContent = recorder;
    
    // 填充编辑表单基本信息
    document.getElementById('im-edit-exam-id').value = examId;
    document.getElementById('im-edit-patient-name').value = patientName;
    
    // 填充主检医生和信息录入员（编辑模式）
    document.getElementById('im-edit-chief-doctor').value = deptData && deptData.chiefDoctor ? deptData.chiefDoctor : '';
    document.getElementById('im-edit-recorder').value = deptData && deptData.recorder ? deptData.recorder : getCurrentUser();
    
    // 根据状态决定显示模式
    if (status === '待录入') {
        // 待录入状态：直接显示编辑模式
        document.getElementById('internal-medicine-view-mode').style.display = 'none';
        document.getElementById('internal-medicine-edit-mode').style.display = 'block';
        document.getElementById('internal-medicine-view-buttons').style.display = 'none';
        document.getElementById('internal-medicine-edit-buttons').style.display = 'flex';
        
        // 初始化编辑表单（空值）
        initializeEditForm(null);
        
        // 如果有已上传的图片，显示"开始AI解析"按钮
        setTimeout(() => {
            const aiParseBtn = document.getElementById('im-edit-ai-parse-btn');
            if (aiParseBtn) {
                if (currentImages && currentImages.length > 0) {
                    aiParseBtn.style.display = 'inline-block';
                } else {
                    aiParseBtn.style.display = 'none';
                }
            }
        }, 100);
    } else if (status === 'AI解析中') {
        // AI解析中：显示查看模式（只读）
        document.getElementById('internal-medicine-view-mode').style.display = 'block';
        document.getElementById('internal-medicine-edit-mode').style.display = 'none';
        document.getElementById('internal-medicine-view-buttons').style.display = 'flex';
        document.getElementById('internal-medicine-edit-buttons').style.display = 'none';
        
        // 填充查看数据
        if (deptData) {
            fillViewData(deptData, status);
            // 填充编辑表单（用于编辑时）
            initializeEditForm(deptData);
        } else {
            fillViewData({}, status);
            initializeEditForm(null);
        }
        // 隐藏编辑按钮和确认结果按钮（AI解析中不允许编辑和确认）
        const editBtn = document.getElementById('internal-medicine-edit-btn');
        const confirmBtn = document.getElementById('internal-medicine-confirm-btn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
        if (confirmBtn) {
            confirmBtn.style.display = 'none';
        }
    } else {
        // 已录入或AI解析完成：显示查看模式（可编辑）
        document.getElementById('internal-medicine-view-mode').style.display = 'block';
        document.getElementById('internal-medicine-edit-mode').style.display = 'none';
        document.getElementById('internal-medicine-view-buttons').style.display = 'flex';
        document.getElementById('internal-medicine-edit-buttons').style.display = 'none';
        
        // 填充查看数据
        // 如果是"AI解析完成"状态，即使deptData为空也会自动填充模拟数据
        if (deptData || status === 'AI解析完成') {
            fillViewData(deptData || {}, status);
            
            // 填充编辑表单（用于编辑时）
            // 如果状态是"AI解析完成"且数据不完整，使用模拟数据填充编辑表单
            let editFormData = deptData;
            if (status === 'AI解析完成' && (!deptData || !deptData.heartRate)) {
                const department = currentExaminationInfo.department;
                if (department === '内科' || department === '物理检查' || department === '生化检查') {
                    editFormData = {
                        ...deptData,
                        heartRate: 72,
                        heartRhythm: '齐',
                        heartMurmur: '无',
                        lungAuscultation: '双肺呼吸音清，未闻及干湿性啰音',
                        liverSpleen: '肋下未触及',
                        medicalHistory: '无特殊病史',
                        doctorSummary: '心率正常，心律齐，无杂音，肺部听诊正常，肝脾未触及。',
                        aiResult: '根据AI分析，心电图显示窦性心律，心率72次/分，节律规整，PR间期正常，QRS波群形态正常。心电波形正常，无明显异常。胸部X线片显示双肺纹理清晰，未见明显异常密度影，心影大小正常，膈面光滑。',
                        aiSuggestion: '建议：1. 继续保持良好的生活习惯，规律作息，保证充足睡眠；2. 适量运动，增强体质，建议每周至少150分钟中等强度运动；3. 定期体检，建议每年复查一次心电图和胸部X线；4. 如有心悸、胸闷等不适症状，及时就医；5. 注意监测血压和心率变化。',
                        images: deptData?.images || []
                    };
                }
            }
            initializeEditForm(editFormData);
        } else {
            fillViewData({}, status);
            initializeEditForm(null);
        }
        
        // 根据状态控制按钮显示
        const editBtn = document.getElementById('internal-medicine-edit-btn');
        const confirmBtn = document.getElementById('internal-medicine-confirm-btn');
        
        if (status === 'AI解析完成') {
            // AI解析完成：显示"确认结果"按钮，隐藏"编辑"按钮
            if (editBtn) {
                editBtn.style.display = 'none';
            }
            if (confirmBtn) {
                confirmBtn.style.display = 'inline-block';
            }
        } else {
            // 已录入：显示"编辑"按钮，隐藏"确认结果"按钮
            if (editBtn) {
                editBtn.style.display = 'inline-block';
            }
            if (confirmBtn) {
                confirmBtn.style.display = 'none';
            }
        }
    }
    
    // 显示模态框
    document.getElementById('internal-medicine-modal').classList.add('active');
}

// 填充查看数据
function fillViewData(data, status) {
    // 如果没有传入status，尝试从数据中获取
    if (!status && data && data.status) {
        status = data.status;
    }
    
    // 如果是"AI解析完成"状态且数据不完整，生成模拟的AI解析结果
    if (status === 'AI解析完成') {
        // 如果数据为空或不完整，使用模拟数据
        if (!data || !data.heartRate) {
            // 根据检查类别生成不同的模拟数据
            const department = currentExaminationInfo.department;
            let mockData = {};
            
            if (department === '一般检查') {
                mockData = {
                    height: 170,
                    weight: 65,
                    bloodPressure: '120/80',
                    pulseRate: 72,
                    doctorSummary: '身高体重指数正常，血压、脉率未见明显异常。',
                    aiResult: 'AI分析：一般检查项目指标均在参考范围内。',
                    aiSuggestion: '建议：1. 保持规律作息与均衡饮食；2. 适量运动；3. 定期体检。',
                    images: []
                };
            } else if (department === '内科' || department === '物理检查' || department === '生化检查') {
                mockData = {
                    heartRate: 72,
                    heartRhythm: '齐',
                    heartMurmur: '无',
                    lungAuscultation: '双肺呼吸音清，未闻及干湿性啰音',
                    liverSpleen: '肋下未触及',
                    medicalHistory: '无特殊病史',
                    doctorSummary: '心率正常，心律齐，无杂音，肺部听诊正常，肝脾未触及。',
                    aiResult: '根据AI分析，心电图显示窦性心律，心率72次/分，节律规整，PR间期正常，QRS波群形态正常。心电波形正常，无明显异常。胸部X线片显示双肺纹理清晰，未见明显异常密度影，心影大小正常，膈面光滑。',
                    aiSuggestion: '建议：1. 继续保持良好的生活习惯，规律作息，保证充足睡眠；2. 适量运动，增强体质，建议每周至少150分钟中等强度运动；3. 定期体检，建议每年复查一次心电图和胸部X线；4. 如有心悸、胸闷等不适症状，及时就医；5. 注意监测血压和心率变化。',
                    images: []
                };
            } else if (department === '外科' || department === '专项检查') {
                mockData = {
                    height: 175,
                    weight: 72,
                    skinMucosa: '皮肤粘膜检查未见异常，无皮疹、色素沉着',
                    spineLimbs: '脊柱四肢检查正常，无畸形，活动自如',
                    thyroid: '甲状腺检查未见异常，无肿大',
                    lymphNodes: '浅表淋巴结检查未见异常',
                    joints: '关节检查正常，无红肿、压痛',
                    medicalHistory: '无特殊病史',
                    aiResult: 'AI分析显示：身高175cm，体重72kg，BMI 23.5，属于正常范围。皮肤粘膜检查未见异常，无皮疹、色素沉着。脊柱四肢检查正常，无畸形，活动自如。甲状腺检查未见异常，无肿大。浅表淋巴结检查未见异常。关节检查正常，无红肿、压痛。',
                    aiSuggestion: '建议：1. 保持当前体重，注意饮食均衡，避免高脂、高糖食物；2. 适当增加运动量，建议每周至少150分钟中等强度运动；3. 定期体检，建议每年复查一次；4. 保持良好的作息习惯，避免久坐；5. 注意保护关节，避免过度运动。',
                    images: []
                };
            } else {
                // 其他科室的默认数据
                mockData = {
                    aiResult: 'AI分析已完成，检查结果正常，未见明显异常。',
                    aiSuggestion: '建议：1. 定期体检；2. 保持良好的生活习惯；3. 如有不适及时就医。',
                    images: []
                };
            }
            
            // 合并现有数据和模拟数据
            data = data ? {
                ...data,
                ...mockData
            } : mockData;
        }
    }
    
    // 检查数据是否为空（AI解析完成状态的数据已经在上面填充了）
    if (!data || (status !== 'AI解析完成' && Object.keys(data).length === 0)) {
        // 如果没有数据（且不是AI解析完成状态），也要处理按钮显示
        const aiParseSection = document.getElementById('im-ai-parse-section');
        if (aiParseSection) {
            aiParseSection.style.display = 'none';
        }
        // 隐藏AI解析结果区域（除非是AI解析完成状态）
        const aiResultSection = document.getElementById('im-ai-result-section');
        if (aiResultSection) {
            if (status === 'AI解析完成') {
                aiResultSection.style.display = 'block';
                document.getElementById('im-ai-result').textContent = 'AI分析已完成，检查结果正常，未见明显异常。';
                document.getElementById('im-ai-suggestion').textContent = '建议：1. 定期体检；2. 保持良好的生活习惯；3. 如有不适及时就医。';
            } else {
                aiResultSection.style.display = 'none';
            }
        }
        // 如果没有任何数据（且不是AI解析完成状态），直接返回
        if (status !== 'AI解析完成') {
            return;
        }
    }
    
    // 确保data不为空（AI解析完成状态应该已经有数据了）
    if (!data) {
        data = {};
    }
    
    // 填充检查数据（如果数据中有值就显示，没有值显示"-"）
    document.getElementById('im-heart-rate').textContent = (data.heartRate !== undefined && data.heartRate !== null) ? data.heartRate + ' bpm' : '-';
    document.getElementById('im-heart-rhythm').textContent = data.heartRhythm || '-';
    document.getElementById('im-heart-murmur').textContent = data.heartMurmur || '-';
    document.getElementById('im-lung-auscultation').textContent = data.lungAuscultation || '-';
    document.getElementById('im-liver-spleen').textContent = data.liverSpleen || '-';
    document.getElementById('im-medical-history').textContent = data.medicalHistory || '-';
    document.getElementById('im-doctor-summary').textContent = data.doctorSummary || '-';
    
    // 显示图片
    const imagesContainer = document.getElementById('im-images-container');
    imagesContainer.innerHTML = '';
    if (data.images && data.images.length > 0) {
        data.images.forEach((imageUrl, index) => {
            const imgItem = createImageItem(imageUrl, index, false);
            imagesContainer.appendChild(imgItem);
        });
    } else {
        imagesContainer.innerHTML = '<span style="color: #999;">无图片</span>';
    }
    
    // 根据状态显示/隐藏"开始AI解析"按钮
    const aiParseSection = document.getElementById('im-ai-parse-section');
    if (aiParseSection) {
        // 只有在"待录入"状态且有图片时显示"开始AI解析"按钮
        if (status === '待录入' && data.images && data.images.length > 0) {
            aiParseSection.style.display = 'block';
        } else {
            aiParseSection.style.display = 'none';
        }
    }
    
    // 根据状态显示/隐藏AI解析结果区域
    const aiResultSection = document.getElementById('im-ai-result-section');
    if (aiResultSection) {
        if (status === 'AI解析完成') {
            aiResultSection.style.display = 'block';
            // 填充AI解析结果和建议（确保有值）
            const aiResult = data.aiResult || '根据AI分析，检查结果正常，未见明显异常。';
            const aiSuggestion = data.aiSuggestion || '建议：1. 定期体检；2. 保持良好的生活习惯；3. 如有不适及时就医。';
            document.getElementById('im-ai-result').textContent = aiResult;
            document.getElementById('im-ai-suggestion').textContent = aiSuggestion;
        } else {
            aiResultSection.style.display = 'none';
        }
    }
}

// 初始化编辑表单
function initializeEditForm(data) {
    const form = document.getElementById('internal-medicine-form');
    
    if (data) {
        form['heartRate'].value = data.heartRate || '';
        form['heartRhythm'].value = data.heartRhythm || '';
        form['heartMurmur'].value = data.heartMurmur || '无';
        form['lungAuscultation'].value = data.lungAuscultation || '双肺呼吸音清，未闻及干湿性啰音';
        form['liverSpleen'].value = data.liverSpleen || '肋下未触及';
        form['medicalHistory'].value = data.medicalHistory || '';
        form['doctorSummary'].value = data.doctorSummary || '';
        form['chiefDoctor'].value = data.chiefDoctor || '';
        document.getElementById('im-edit-recorder').value = data.recorder || getCurrentUser();
        currentImages = data.images ? [...data.images] : [];
    } else {
        form['heartRate'].value = '';
        form['heartRhythm'].value = '';
        form['heartMurmur'].value = '无';
        form['lungAuscultation'].value = '双肺呼吸音清，未闻及干湿性啰音';
        form['liverSpleen'].value = '肋下未触及';
        form['medicalHistory'].value = '';
        form['doctorSummary'].value = '';
        form['chiefDoctor'].value = '';
        document.getElementById('im-edit-recorder').value = getCurrentUser();
        currentImages = [];
    }
    
    // 显示图片
    renderEditImages();
    
    // 监听医生小结自动汇总
    setupAutoSummary();
}

// 设置自动汇总
function setupAutoSummary() {
    const form = document.getElementById('internal-medicine-form');
    const summaryField = form['doctorSummary'];
    
    // 移除之前的监听器
    const inputs = ['heartRate', 'heartRhythm', 'heartMurmur', 'lungAuscultation', 'liverSpleen', 'medicalHistory'];
    inputs.forEach(fieldName => {
        const field = form[fieldName];
        if (field) {
            field.removeEventListener('input', generateSummary);
            field.addEventListener('input', generateSummary);
        }
    });
}

// 生成医生小结
function generateSummary() {
    const form = document.getElementById('internal-medicine-form');
    const summaryField = form['doctorSummary'];
    
    const heartRate = form['heartRate'].value;
    const heartRhythm = form['heartRhythm'].value;
    const heartMurmur = form['heartMurmur'].value;
    const lungAuscultation = form['lungAuscultation'].value;
    const liverSpleen = form['liverSpleen'].value;
    const medicalHistory = form['medicalHistory'].value;
    
    let summary = [];
    
    if (heartRate) {
        const rate = parseInt(heartRate);
        if (rate < 60) summary.push('心率偏慢');
        else if (rate > 100) summary.push('心率偏快');
        else summary.push('心率正常');
    }
    
    if (heartRhythm) {
        if (heartRhythm === '不齐' || heartRhythm === '绝对不齐') {
            summary.push('心律' + heartRhythm);
        } else {
            summary.push('心律齐');
        }
    }
    
    if (heartMurmur === '有') {
        summary.push('可闻及心杂音');
    } else if (heartMurmur === '无') {
        summary.push('无杂音');
    }
    
    if (lungAuscultation && lungAuscultation !== '双肺呼吸音清，未闻及干湿性啰音') {
        summary.push('肺部听诊：' + lungAuscultation);
    } else {
        summary.push('肺部听诊正常');
    }
    
    if (liverSpleen && liverSpleen !== '肋下未触及') {
        summary.push('肝/脾触诊：' + liverSpleen);
    } else {
        summary.push('肝脾未触及');
    }
    
    if (medicalHistory) {
        summary.push('病史：' + medicalHistory);
    }
    
    summaryField.value = summary.join('，') + '。';
}

// 处理图片上传
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImages.push(e.target.result);
                renderEditImages();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 清空input，允许重复选择同一文件
    event.target.value = '';
}

// 渲染编辑模式的图片
function renderEditImages() {
    const container = document.getElementById('im-edit-images-container');
    container.innerHTML = '';
    
    if (currentImages.length === 0) {
        // 如果没有图片，隐藏"开始AI解析"按钮
        const aiParseBtn = document.getElementById('im-edit-ai-parse-btn');
        if (aiParseBtn) {
            aiParseBtn.style.display = 'none';
        }
        return;
    }
    
    currentImages.forEach((imageUrl, index) => {
        const imgItem = createImageItem(imageUrl, index, true);
        container.appendChild(imgItem);
    });
    
    // 如果有图片且状态为"待录入"，显示"开始AI解析"按钮
    const examData = examinationData[currentExaminationInfo.examId];
    const deptData = examData && examData[currentExaminationInfo.department] ? examData[currentExaminationInfo.department] : null;
    const status = deptData && deptData.status ? deptData.status : '待录入';
    const aiParseBtn = document.getElementById('im-edit-ai-parse-btn');
    if (aiParseBtn && status === '待录入') {
        aiParseBtn.style.display = 'inline-block';
    }
}

// 创建图片项
function createImageItem(imageUrl, index, editable) {
    const item = document.createElement('div');
    item.className = 'image-item';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '检查图片';
    
    item.appendChild(img);
    
    if (editable) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'image-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = function() {
            currentImages.splice(index, 1);
            renderEditImages();
        };
        item.appendChild(removeBtn);
    }
    
    return item;
}

// 开始AI解析
function startAIParse() {
    if (!currentExaminationInfo.examId || !currentExaminationInfo.department) {
        alert('检查信息不存在');
        return;
    }
    
    // 检查是否有图片
    const examData = examinationData[currentExaminationInfo.examId];
    const deptData = examData && examData[currentExaminationInfo.department] ? examData[currentExaminationInfo.department] : null;
    const existingImages = deptData && deptData.images ? deptData.images : [];
    const allImages = currentImages.length > 0 ? currentImages : existingImages;
    
    if (!allImages || allImages.length === 0) {
        alert('请先上传图片后再开始AI解析');
        return;
    }
    
    // 确认操作
    if (!confirm('确定要开始AI解析吗？')) {
        return;
    }
    
    // 更新状态为"AI解析中"
    if (!examinationData[currentExaminationInfo.examId]) {
        examinationData[currentExaminationInfo.examId] = {};
    }
    
    examinationData[currentExaminationInfo.examId][currentExaminationInfo.department] = {
        ...examinationData[currentExaminationInfo.examId][currentExaminationInfo.department],
        status: 'AI解析中',
        images: allImages
    };
    
    console.log('开始AI解析:', currentExaminationInfo);
    
    // 这里可以添加实际的AI解析API调用
    // 模拟AI解析过程
    alert('AI解析已开始，请稍候...');
    
    // 关闭弹窗并刷新（实际项目中应该刷新表格）
    closeInternalMedicineModal();
    // refreshExaminationTable();
}

// 启用编辑模式
function enableInternalMedicineEdit() {
    document.getElementById('internal-medicine-view-mode').style.display = 'none';
    document.getElementById('internal-medicine-edit-mode').style.display = 'block';
    document.getElementById('internal-medicine-view-buttons').style.display = 'none';
    document.getElementById('internal-medicine-edit-buttons').style.display = 'flex';
}

// 取消编辑
function cancelInternalMedicineEdit() {
    const examId = currentExaminationInfo.examId;
    const department = currentExaminationInfo.department;
    const examData = examinationData[examId];
    const deptData = examData && examData[department] ? examData[department] : null;
    
    // 重新加载数据
    if (deptData && (deptData.status === '已录入' || deptData.status === 'AI解析完成')) {
        initializeEditForm(deptData);
        document.getElementById('internal-medicine-view-mode').style.display = 'block';
        document.getElementById('internal-medicine-edit-mode').style.display = 'none';
        document.getElementById('internal-medicine-view-buttons').style.display = 'flex';
        document.getElementById('internal-medicine-edit-buttons').style.display = 'none';
        
        // 根据状态控制按钮显示
        const editBtn = document.getElementById('internal-medicine-edit-btn');
        const confirmBtn = document.getElementById('internal-medicine-confirm-btn');
        const deptStatus = deptData && deptData.status ? deptData.status : '待录入';
        
        if (deptStatus === 'AI解析完成') {
            // AI解析完成：显示"确认结果"按钮，隐藏"编辑"按钮
            if (editBtn) {
                editBtn.style.display = 'none';
            }
            if (confirmBtn) {
                confirmBtn.style.display = 'inline-block';
            }
        } else {
            // 已录入：显示"编辑"按钮，隐藏"确认结果"按钮
            if (editBtn) {
                editBtn.style.display = 'inline-block';
            }
            if (confirmBtn) {
                confirmBtn.style.display = 'none';
            }
        }
        
        fillViewData(deptData, deptStatus);
    } else {
        initializeEditForm(null);
    }
}

// 保存内科检查数据
function saveInternalMedicine() {
    const form = document.getElementById('internal-medicine-form');
    
    // 验证必填项
    const heartRate = form['heartRate'].value;
    const heartRhythm = form['heartRhythm'].value;
    
    if (!heartRate) {
        alert('请输入心率');
        form['heartRate'].focus();
        return;
    }
    
    if (!heartRhythm) {
        alert('请选择心律');
        form['heartRhythm'].focus();
        return;
    }
    
    const examId = currentExaminationInfo.examId;
    const department = currentExaminationInfo.department;
    
    // 保存数据
    if (!examinationData[examId]) {
        examinationData[examId] = {};
    }
    
    examinationData[examId][department] = {
        status: '已录入',
        heartRate: parseInt(heartRate),
        heartRhythm: form['heartRhythm'].value,
        heartMurmur: form['heartMurmur'].value,
        lungAuscultation: form['lungAuscultation'].value,
        liverSpleen: form['liverSpleen'].value,
        medicalHistory: form['medicalHistory'].value,
        doctorSummary: form['doctorSummary'].value,
        chiefDoctor: form['chiefDoctor'].value || '',
        recorder: getCurrentUser(), // 信息录入员使用当前登录用户
        images: [...currentImages]
    };
    
    console.log('保存内科检查数据:', examinationData[examId][department]);
    
    alert('检查数据保存成功！');
    
    // 关闭弹窗并刷新页面（实际项目中应该刷新表格）
    closeInternalMedicineModal();
    // 实际项目中，这里应该刷新表格数据
    // refreshExaminationTable();
}

// 打印内科检查数据
function printInternalMedicine() {
    const examId = currentExaminationInfo.examId;
    const department = currentExaminationInfo.department;
    const examData = examinationData[examId];
    const deptData = examData && examData[department] ? examData[department] : null;
    
    if (!deptData || deptData.status !== '已录入') {
        alert('请先保存检查数据后再打印');
        return;
    }
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent(currentExaminationInfo, deptData);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// 生成打印内容
function generatePrintContent(info, data) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>内科检查报告</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { margin: 0; font-size: 24px; }
                .info-section { margin-bottom: 20px; }
                .info-section h3 { border-bottom: 2px solid #333; padding-bottom: 5px; }
                .info-row { display: flex; margin: 10px 0; }
                .info-label { font-weight: bold; width: 120px; }
                .info-value { flex: 1; }
                .data-section { margin-top: 20px; }
                .data-item { margin: 8px 0; }
                @media print {
                    body { padding: 10px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>内科检查报告</h1>
            </div>
            <div class="info-section">
                <h3>检查信息</h3>
                <div class="info-row">
                    <span class="info-label">体检编号：</span>
                    <span class="info-value">${info.examId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">患者姓名：</span>
                    <span class="info-value">${info.patientName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">检查科室：</span>
                    <span class="info-value">${info.department}</span>
                </div>
                <div class="info-row" style="display: flex; align-items: flex-end; margin: 15px 0;">
                    <span class="info-label" style="margin-right: 10px;">主检医生：</span>
                    <span style="flex: 1; border-bottom: 2px solid #333; min-width: 200px; text-align: center; padding-bottom: 3px;">${data.chiefDoctor || ''}</span>
                </div>
                <div class="info-row" style="display: flex; align-items: flex-end; margin: 15px 0;">
                    <span class="info-label" style="margin-right: 10px;">录入员：</span>
                    <span style="flex: 1; border-bottom: 2px solid #333; min-width: 200px; text-align: center; padding-bottom: 3px;">${data.recorder || ''}</span>
                </div>
            </div>
            <div class="data-section">
                <h3>检查数据</h3>
                <div class="data-item"><strong>心率：</strong> ${data.heartRate ? data.heartRate + ' bpm' : '-'}</div>
                <div class="data-item"><strong>心律：</strong> ${data.heartRhythm || '-'}</div>
                <div class="data-item"><strong>心杂音：</strong> ${data.heartMurmur || '-'}</div>
                <div class="data-item"><strong>肺部听诊：</strong> ${data.lungAuscultation || '-'}</div>
                <div class="data-item"><strong>肝/脾触诊：</strong> ${data.liverSpleen || '-'}</div>
                <div class="data-item"><strong>病史记录：</strong> ${data.medicalHistory || '-'}</div>
                <div class="data-item"><strong>医生小结：</strong> ${data.doctorSummary || '-'}</div>
            </div>
        </body>
        </html>
    `;
}

// 确认AI解析结果
function confirmAIResult() {
    if (!currentExaminationInfo.examId || !currentExaminationInfo.department) {
        alert('检查信息不存在');
        return;
    }
    
    // 确认操作
    if (!confirm('确认将AI解析结果确认并转为已录入状态吗？')) {
        return;
    }
    
    const examId = currentExaminationInfo.examId;
    const department = currentExaminationInfo.department;
    
    // 获取当前数据
    if (!examinationData[examId]) {
        examinationData[examId] = {};
    }
    
    const deptData = examinationData[examId][department] || {};
    
    // 将状态更新为"已录入"，保留AI解析结果和建议
    examinationData[examId][department] = {
        ...deptData,
        status: '已录入'
        // 保留原有的AI解析结果和建议数据
    };
    
    console.log('确认AI解析结果，状态已更新为已录入:', examinationData[examId][department]);
    
    // 这里可以添加实际的API调用保存数据
    alert('AI解析结果已确认，状态已更新为"已录入"！');
    
    // 关闭弹窗（实际项目中应该刷新表格）
    closeInternalMedicineModal();
    // refreshExaminationTable();
}

// 关闭内科检查模态框
function closeInternalMedicineModal() {
    document.getElementById('internal-medicine-modal').classList.remove('active');
    // 重置为查看模式
    document.getElementById('internal-medicine-view-mode').style.display = 'block';
    document.getElementById('internal-medicine-edit-mode').style.display = 'none';
    document.getElementById('internal-medicine-view-buttons').style.display = 'flex';
    document.getElementById('internal-medicine-edit-buttons').style.display = 'none';
    
    // 重置按钮显示状态
    const editBtn = document.getElementById('internal-medicine-edit-btn');
    const confirmBtn = document.getElementById('internal-medicine-confirm-btn');
    if (editBtn) {
        editBtn.style.display = 'inline-block';
    }
    if (confirmBtn) {
        confirmBtn.style.display = 'none';
    }
    
    currentExaminationInfo = { examId: null, department: null, patientName: null };
    currentImages = [];
}

// 点击模态框外部关闭
document.addEventListener('click', function(e) {
    const packageAdjustmentModal = document.getElementById('package-adjustment-modal');
    const examItemModal = document.getElementById('exam-item-modal');
    const examDepartmentModal = document.getElementById('exam-department-modal');
    const examProjectModal = document.getElementById('exam-project-modal');
    const packageModal = document.getElementById('package-modal');
    const patientModal = document.getElementById('patient-detail-modal');
    const addPatientModal = document.getElementById('add-patient-modal');
    const appointmentModal = document.getElementById('appointment-detail-modal');
    const addAppointmentModal = document.getElementById('add-appointment-modal');
    
    if (e.target === packageAdjustmentModal) {
        closePackageAdjustmentModal();
    }
    if (e.target === examItemModal) {
        closeExamItemModal();
    }
    if (e.target === examDepartmentModal) {
        closeExamDepartmentModal();
    }
    if (e.target === examProjectModal) {
        closeExamProjectModal();
    }
    if (e.target === packageModal) {
        closePackageModal();
    }
    if (e.target === patientModal) {
        closePatientDetailModal();
    }
    if (e.target === addPatientModal) {
        closeAddPatientModal();
    }
    if (e.target === appointmentModal) {
        closeAppointmentDetailModal();
    }
    if (e.target === addAppointmentModal) {
        closeAddAppointmentModal();
    }

    if (!e.target.closest('.input-type-multiselect')) {
        closeExamInputTypeMenu();
    }
    
    // 点击患者下拉框外部时关闭下拉框
    if (!e.target.closest('.patient-select-wrapper')) {
        hidePatientDropdown();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePackageAdjustmentModal();
        closeExamItemModal();
        closeExamDepartmentModal();
        closeExamProjectModal();
        closePackageModal();
        closePatientDetailModal();
        closeAddPatientModal();
        closeAppointmentDetailModal();
        closeAddAppointmentModal();
        closeInternalMedicineModal();
        closeReportViewModal();
        closeCompleteReportModal();
    }
});

// ==================== 体检报告管理 ====================

// 初始化报告管理页面
function initializeReportPage() {
    // 控制下载按钮显示（只在"已生成"状态时显示）
    updateReportDownloadButtons();
    
    // 状态筛选
    const statusFilter = document.getElementById('report-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterReportTable();
        });
    }
    
    // 搜索功能
    const searchInput = document.getElementById('report-search');
    const searchBtn = document.querySelector('#report-page .search-btn');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterReportTable();
        });
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            filterReportTable();
        });
    }
}

// 更新报告表格中的下载按钮和查看完成报告按钮显示
function updateReportDownloadButtons() {
    const table = document.querySelector('#report-page tbody');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const status = row.getAttribute('data-status');
        const downloadBtn = row.querySelector('.btn-download');
        const completeBtn = row.querySelector('.btn-secondary');
        
        if (downloadBtn) {
            // 只在"已生成"状态时显示下载按钮
            if (status === '已生成') {
                downloadBtn.style.display = 'inline-block';
            } else {
                downloadBtn.style.display = 'none';
            }
        }
        
        // 控制"查看完成报告"按钮（通过检查按钮文本内容来识别）
        if (completeBtn && completeBtn.textContent.includes('查看完成报告')) {
            if (status === '已生成') {
                completeBtn.style.display = 'inline-block';
            } else {
                completeBtn.style.display = 'none';
            }
        }
    });
}

// 筛选报告表格
function filterReportTable() {
    const statusFilter = document.getElementById('report-status-filter');
    const searchInput = document.getElementById('report-search');
    const table = document.querySelector('#report-page tbody');
    
    if (!table) return;
    
    const selectedStatus = statusFilter ? statusFilter.value : '';
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const status = row.getAttribute('data-status') || '';
        const rowText = row.textContent.toLowerCase();
        
        // 状态筛选
        const statusMatch = !selectedStatus || status === selectedStatus;
        
        // 搜索筛选
        const searchMatch = !searchText || rowText.includes(searchText);
        
        // 显示或隐藏行
        if (statusMatch && searchMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ==================== 报告查看功能 ====================

// 查看报告
function viewReport(reportId, examId, patientName, packageName, examDate, reportStatus) {
    // 填充基本信息
    document.getElementById('report-view-id').textContent = reportId;
    document.getElementById('report-view-patient-name').textContent = patientName;
    document.getElementById('report-view-package-name').textContent = packageName;
    
    // 设置体检日期
    document.getElementById('report-view-exam-date').textContent = examDate || '2024-01-15';
    
    // 根据套餐名称找到套餐信息
    let packageInfo = null;
    for (const pkgId in packageData) {
        if (packageData[pkgId].name === packageName) {
            packageInfo = packageData[pkgId];
            break;
        }
    }
    
    if (!packageInfo) {
        alert('套餐信息不存在');
        return;
    }
    
    // 获取所有检查科室（套餐包含的科室）
    const allDepartments = packageInfo.departments || [];
    
    // 获取体检数据
    const examData = examinationData[examId] || {};
    
    // 生成检查项列表
    const container = document.getElementById('report-examinations-container');
    container.innerHTML = '';
    
    if (allDepartments.length === 0) {
        container.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">暂无检查项</p>';
    } else {
        allDepartments.forEach(department => {
            const deptData = examData[department];
            const status = deptData && deptData.status ? deptData.status : '待录入';
            
            // 创建检查项卡片
            const examCard = document.createElement('div');
            examCard.className = 'examination-card';
            examCard.style.cssText = 'border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #f9f9f9;';
            
            // 科室名称和状态
            let statusBadge = '';
            if (status === '已录入') {
                statusBadge = '<span class="status-badge completed">已录入</span>';
            } else if (status === 'AI解析中') {
                statusBadge = '<span class="status-badge ai-parsing">AI解析中</span>';
            } else if (status === 'AI解析完成') {
                statusBadge = '<span class="status-badge ai-completed">AI解析完成</span>';
            } else {
                statusBadge = '<span class="status-badge pending">待录入</span>';
            }
            
            examCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="margin: 0; font-size: 16px; color: #2c3e50;">${department}</h5>
                    ${statusBadge}
                </div>
                <div class="examination-details" id="exam-details-${department.replace(/\s+/g, '-')}">
                    ${generateExaminationDetails(department, deptData, status)}
                </div>
            `;
            
            container.appendChild(examCard);
        });
    }
    
    // 根据状态显示/隐藏"确认审核"按钮
    const confirmAuditBtn = document.getElementById('report-confirm-audit-btn');
    if (confirmAuditBtn) {
        if (reportStatus === '待审核') {
            confirmAuditBtn.style.display = 'inline-block';
        } else {
            confirmAuditBtn.style.display = 'none';
        }
    }
    
    // 显示模态框
    document.getElementById('report-view-modal').classList.add('active');
}

// 生成检查项详情
function generateExaminationDetails(department, deptData, status) {
    if (!deptData || status === '待录入' || status === 'AI解析中') {
        return '<p style="color: #999; margin: 0;">检查数据尚未录入</p>';
    }
    
    // 根据不同检查类别显示不同的检查数据
    if (department === '一般检查') {
        return `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div>
                    <label style="color: #666; font-size: 13px;">身高：</label>
                    <div style="margin-top: 5px;">${deptData.height != null ? deptData.height + ' cm' : '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">体重：</label>
                    <div style="margin-top: 5px;">${deptData.weight != null ? deptData.weight + ' kg' : '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">血压：</label>
                    <div style="margin-top: 5px;">${deptData.bloodPressure || '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">脉率：</label>
                    <div style="margin-top: 5px;">${deptData.pulseRate != null ? deptData.pulseRate + ' 次/分' : '-'}</div>
                </div>
                <div style="grid-column: 1 / -1;">
                    <label style="color: #666; font-size: 13px;">医生小结：</label>
                    <div style="margin-top: 5px;">${deptData.doctorSummary || '-'}</div>
                </div>
            </div>
        `;
    }
    
    if (department === '内科' || department === '物理检查' || department === '生化检查') {
        return `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div>
                    <label style="color: #666; font-size: 13px;">心率：</label>
                    <div style="margin-top: 5px;">${deptData.heartRate ? deptData.heartRate + ' bpm' : '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">心律：</label>
                    <div style="margin-top: 5px;">${deptData.heartRhythm || '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">心杂音：</label>
                    <div style="margin-top: 5px;">${deptData.heartMurmur || '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">肝/脾触诊：</label>
                    <div style="margin-top: 5px;">${deptData.liverSpleen || '-'}</div>
                </div>
                <div style="grid-column: 1 / -1;">
                    <label style="color: #666; font-size: 13px;">肺部听诊：</label>
                    <div style="margin-top: 5px;">${deptData.lungAuscultation || '-'}</div>
                </div>
                <div style="grid-column: 1 / -1;">
                    <label style="color: #666; font-size: 13px;">病史记录：</label>
                    <div style="margin-top: 5px;">${deptData.medicalHistory || '-'}</div>
                </div>
                <div style="grid-column: 1 / -1;">
                    <label style="color: #666; font-size: 13px;">医生小结：</label>
                    <div style="margin-top: 5px;">${deptData.doctorSummary || '-'}</div>
                </div>
                ${deptData.chiefDoctor || deptData.recorder ? `
                <div>
                    <label style="color: #666; font-size: 13px;">主检医生：</label>
                    <div style="margin-top: 5px;">${deptData.chiefDoctor || '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">信息录入员：</label>
                    <div style="margin-top: 5px;">${deptData.recorder || '-'}</div>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    return `
        <div style="display: grid; gap: 12px;">
            <div>
                <label style="color: #666; font-size: 13px;">医生小结：</label>
                <div style="margin-top: 5px;">${deptData.doctorSummary || '-'}</div>
            </div>
            ${deptData.aiResult ? `
            <div>
                <label style="color: #666; font-size: 13px;">AI解析：</label>
                <div style="margin-top: 5px;">${deptData.aiResult}</div>
            </div>` : ''}
            ${deptData.chiefDoctor || deptData.recorder ? `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div>
                    <label style="color: #666; font-size: 13px;">主检医生：</label>
                    <div style="margin-top: 5px;">${deptData.chiefDoctor || '-'}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 13px;">信息录入员：</label>
                    <div style="margin-top: 5px;">${deptData.recorder || '-'}</div>
                </div>
            </div>` : ''}
        </div>
    `;
}

// 关闭报告查看模态框
function closeReportViewModal() {
    document.getElementById('report-view-modal').classList.remove('active');
}

// 查看完成报告
function viewCompleteReport(reportId, examId, patientName, packageName, examDate) {
    // 填充报告基本信息
    document.getElementById('cr-patient-name').textContent = patientName;
    document.getElementById('cr-user-id').textContent = reportId.replace('RPT', '');
    document.getElementById('cr-exam-number').textContent = examId;
    document.getElementById('cr-exam-number-left').textContent = examId;
    
    // 获取患者详细信息（从patientData中获取）
    let patientInfo = null;
    for (const patId in window.patientData) {
        if (window.patientData[patId].name === patientName) {
            patientInfo = window.patientData[patId];
            break;
        }
    }
    
    // 填充患者信息
    if (patientInfo) {
        const gender = patientInfo.gender === '男' ? '男' : '女';
        document.getElementById('cr-patient-name-gender').textContent = `${patientName}(${gender})`;
        document.getElementById('cr-company').textContent = patientInfo.affiliatedUnit || '-';
        document.getElementById('cr-phone').textContent = patientInfo.phone ? patientInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '-';
        document.getElementById('cr-employee-id').textContent = patientInfo.systemId || '-';
        document.getElementById('cr-card-number').textContent = patientInfo.idNumber ? patientInfo.idNumber.substring(0, 16) : '-';
        document.getElementById('cr-delivery-address').textContent = '-';
    } else {
        document.getElementById('cr-patient-name-gender').textContent = `${patientName}(男)`;
        document.getElementById('cr-company').textContent = '-';
        document.getElementById('cr-phone').textContent = '-';
        document.getElementById('cr-employee-id').textContent = '-';
        document.getElementById('cr-card-number').textContent = '-';
        document.getElementById('cr-delivery-address').textContent = '-';
    }
    
    // 填充项目信息
    document.getElementById('cr-project-number').textContent = reportId;
    document.getElementById('cr-project-name').textContent = packageName;
    document.getElementById('cr-category').textContent = '员工';
    document.getElementById('cr-department').textContent = '-';
    document.getElementById('cr-exam-date').textContent = examDate ? examDate.replace(/-/g, '.') : '-';
    document.getElementById('cr-clinic-name').textContent = '体检中心门诊部 (体检中心门诊部)';
    document.getElementById('cr-clinic-name-bottom').textContent = '体检中心门诊部 (体检中心门诊部)';
    
    // 显示模态框
    document.getElementById('complete-report-modal').classList.add('active');
}

// 关闭完整报告模态框
function closeCompleteReportModal() {
    document.getElementById('complete-report-modal').classList.remove('active');
}

// 打印完整报告
function printCompleteReport() {
    const reportContent = document.getElementById('complete-report-content').innerHTML;
    const footerContent = document.getElementById('complete-report-footer').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>完整体检报告</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                @media print {
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
            <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                ${footerContent.replace(/position:\s*fixed[^;]*;?/g, '').replace(/bottom:\s*[^;]*;?/g, '').replace(/left:\s*[^;]*;?/g, '').replace(/transform:\s*[^;]*;?/g, '').replace(/width:\s*calc[^;]*;?/g, '').replace(/max-width:\s*[^;]*;?/g, '').replace(/box-shadow:\s*[^;]*;?/g, '').replace(/z-index:\s*[^;]*;?/g, '')}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// 编辑完整报告
function editCompleteReport() {
    // 这里可以实现编辑功能
    // 暂时使用alert提示，实际项目中应该打开编辑表单
    alert('编辑功能待实现：可以编辑报告中的各项信息');
    
    // 实际项目中可以这样实现：
    // 1. 打开编辑模态框
    // 2. 允许编辑患者信息、项目信息、底部信息等
    // 3. 保存后更新报告显示
}

// ==================== 账号系统 ====================

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn !== 'true' || !currentUser) {
        // 未登录，跳转到登录页面
        window.location.href = '../Login/index.html';
        return false;
    }
    
    return true;
}

// 初始化用户下拉菜单
function initUserDropdown() {
    const userName = document.getElementById('current-user');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    
    if (!userName || !dropdownMenu) return;
    
    // 点击用户名显示/隐藏下拉菜单
    userName.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function(e) {
        if (!userName.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
    
    // 阻止下拉菜单内部的点击事件冒泡
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// 登出功能
function logout() {
    if (confirm('确定要登出吗？')) {
        // 清除登录信息
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        
        // 跳转到登录页面
        window.location.href = '../Login/index.html';
        
        // 关闭下拉菜单
        const dropdownMenu = document.getElementById('user-dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    }
}

