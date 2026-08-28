    const DAILY_WORKING_HOURS = 8;
    const WEEKLY_DAYS = 5;
    const MONTHLY_WEEKS = 4;
    const TOTAL_MONTHLY_HOURS = DAILY_WORKING_HOURS * WEEKLY_DAYS * MONTHLY_WEEKS;
    const TAX_RATE = 0.20;

    let employees = [];
    let currentUser = null;
    let exchangeRates = { USD: 1, SAR: 3.75, EUR: 0.92 };

    function saveEmployeesToLocalStorage() {
        localStorage.setItem('salaryAppEmployees', JSON.stringify(employees));
    }

    function loadEmployeesFromLocalStorage() {
        const saved = localStorage.getItem('salaryAppEmployees');
        if (saved && JSON.parse(saved).length > 0) {
            employees = JSON.parse(saved);
        } else {
            // Default demo data (Ali & Ahmed)
            employees = [
                { name: "Ali", basicUSD: 8516.22, bonusUSD: 496.78, penaltyUSD: 255.49, extraHours: 3.75, jobTitle: "Operator", hourValueUSD: 8516.22/160, extraTotalUSD: (8516.22/160)*3.75, grossUSD: 9396.23, taxesUSD: 2067.17, netUSD: 7329.06 },
                { name: "Ahmed", basicUSD: 9935.89, bonusUSD: 851.62, penaltyUSD: 354.84, extraHours: 4.375, jobTitle: "Admin", hourValueUSD: 9935.89/160, extraTotalUSD: (9935.89/160)*4.375*2, grossUSD: 11301.73, taxesUSD: 2486.38, netUSD: 8815.35 }
            ];
            saveEmployeesToLocalStorage();
        }
    }

    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) throw new Error();
            const data = await response.json();
            exchangeRates = {
                USD: 1,
                SAR: data.rates.SAR || 3.75,
                EUR: data.rates.EUR || 0.92
            };
        } catch (error) {
            console.warn("Using fallback rates");
            exchangeRates = { USD: 1, SAR: 3.75, EUR: 0.92 };
        }
    }

    function calculateSalary(basicUSD, bonusUSD, penaltyUSD, extraHours, jobTitle) {
        const hourRate = basicUSD / TOTAL_MONTHLY_HOURS;
        let extraValue = 0;
        if (jobTitle === 'Operator') extraValue = extraHours * hourRate;
        else if (jobTitle === 'Salesman') extraValue = extraHours * hourRate * 1.5;
        else if (jobTitle === 'Admin') extraValue = extraHours * hourRate * 2;
        else extraValue = extraHours * hourRate;

        const grossSalary = basicUSD + bonusUSD - penaltyUSD + extraValue;
        const taxes = grossSalary * TAX_RATE;
        const netSalary = grossSalary - taxes;

        return { hourValueUSD: hourRate, extraTotalUSD: extraValue, grossUSD: grossSalary, taxesUSD: taxes, netUSD: netSalary };
    }

    function convertCurrency(amountUSD, targetCurrency) {
        const rate = exchangeRates[targetCurrency] || 1;
        return amountUSD * rate;
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function renderTable() {
        const tbody = document.getElementById('tableBody');
        const currency = document.getElementById('currencySelect')?.value || 'USD';
        const symbol = currency === 'USD' ? '$' : (currency === 'SAR' ? '﷼' : '€');

        if (!employees.length) {
            tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">📋 No employees added</td></tr>';
            return;
        }

        let html = '';
        for (let emp of employees) {
            const basicConv = convertCurrency(emp.basicUSD, currency);
            const bonusConv = convertCurrency(emp.bonusUSD, currency);
            const penaltyConv = convertCurrency(emp.penaltyUSD, currency);
            const hourValConv = convertCurrency(emp.hourValueUSD, currency);
            const extraConv = convertCurrency(emp.extraTotalUSD, currency);
            const grossConv = convertCurrency(emp.grossUSD, currency);
            const taxesConv = convertCurrency(emp.taxesUSD, currency);
            const netConv = convertCurrency(emp.netUSD, currency);

            html += `<tr>
                        <td>${escapeHtml(emp.name)}</td>
                        <td>${symbol} ${basicConv.toFixed(2)}</td>
                        <td>${symbol} ${bonusConv.toFixed(2)}</td>
                        <td>${symbol} ${penaltyConv.toFixed(2)}</td>
                        <td>${emp.extraHours}</td>
                        <td>${symbol} ${hourValConv.toFixed(2)}</td>
                        <td>${symbol} ${extraConv.toFixed(2)}</td>
                        <td>${symbol} ${grossConv.toFixed(2)}</td>
                        <td>${(TAX_RATE*100).toFixed(0)}%</td>
                        <td>${symbol} ${taxesConv.toFixed(2)}</td>
                        <td>${symbol} ${netConv.toFixed(2)}</td>
                    </tr>`;
        }
        tbody.innerHTML = html;
    }

    function renderEmployeeView() {
        if (!currentUser || currentUser.role !== 'employee') return renderTable();
        const filtered = employees.filter(emp => emp.name.toLowerCase() === currentUser.name.toLowerCase());
        const tbody = document.getElementById('tableBody');
        const currency = document.getElementById('currencySelect')?.value || 'USD';
        const symbol = currency === 'USD' ? '$' : (currency === 'SAR' ? '﷼' : '€');

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11">🔒 No salary record found for you. Contact admin.</td></tr>';
            return;
        }

        let html = '';
        for (let emp of filtered) {
            const basicConv = convertCurrency(emp.basicUSD, currency);
            const bonusConv = convertCurrency(emp.bonusUSD, currency);
            const penaltyConv = convertCurrency(emp.penaltyUSD, currency);
            const hourValConv = convertCurrency(emp.hourValueUSD, currency);
            const extraConv = convertCurrency(emp.extraTotalUSD, currency);
            const grossConv = convertCurrency(emp.grossUSD, currency);
            const taxesConv = convertCurrency(emp.taxesUSD, currency);
            const netConv = convertCurrency(emp.netUSD, currency);
            html += `<tr>
                        <td>${emp.name}</td>
                        <td>${symbol} ${basicConv.toFixed(2)}</td>
                        <td>${symbol} ${bonusConv.toFixed(2)}</td>
                        <td>${symbol} ${penaltyConv.toFixed(2)}</td>
                        <td>${emp.extraHours}</td>
                        <td>${symbol} ${hourValConv.toFixed(2)}</td>
                        <td>${symbol} ${extraConv.toFixed(2)}</td>
                        <td>${symbol} ${grossConv.toFixed(2)}</td>
                        <td>${(TAX_RATE*100).toFixed(0)}%</td>
                        <td>${symbol} ${taxesConv.toFixed(2)}</td>
                        <td>${symbol} ${netConv.toFixed(2)}</td>
                    </tr>`;
        }
        tbody.innerHTML = html;
    }

    async function addEmployeeAsync() {
        const name = document.getElementById('empName').value.trim();
        const basic = parseFloat(document.getElementById('basicSalary').value);
        const bonus = parseFloat(document.getElementById('bonusAmount').value) || 0;
        const penalty = parseFloat(document.getElementById('penaltyAmount').value) || 0;
        const extraHours = parseFloat(document.getElementById('extraHours').value) || 0;
        const jobTitle = document.getElementById('jobTitle').value;

        if (!name) { alert("Please enter employee name"); return; }
        if (isNaN(basic) || basic <= 0) { alert("Basic salary must be positive"); return; }

        await fetchExchangeRates();
        const { hourValueUSD, extraTotalUSD, grossUSD, taxesUSD, netUSD } = calculateSalary(basic, bonus, penalty, extraHours, jobTitle);

        employees.push({
            name, basicUSD: basic, bonusUSD: bonus, penaltyUSD: penalty,
            extraHours, jobTitle, hourValueUSD, extraTotalUSD, grossUSD, taxesUSD, netUSD
        });

        saveEmployeesToLocalStorage();

        if (currentUser?.role === 'employee') renderEmployeeView();
        else renderTable();

        document.getElementById('empName').value = '';
        document.getElementById('extraHours').value = '0';
        document.getElementById('basicSalary').value = '5000';
        document.getElementById('bonusAmount').value = '0';
        document.getElementById('penaltyAmount').value = '0';
    }

    function clearEmployees() {
        if (confirm("Clear all employee data?")) {
            employees = [];
            saveEmployeesToLocalStorage();
            if (currentUser?.role === 'employee') renderEmployeeView();
            else renderTable();
        }
    }

    function showDashboard() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('salaryDashboard').classList.remove('hidden');
        document.getElementById('logoutRow').classList.remove('hidden');

        if (currentUser && currentUser.role === 'employee') {
            const inputs = document.querySelectorAll('#salaryDashboard input, #salaryDashboard select, #addEmployeeBtn, #clearEmployeesBtn');
            inputs.forEach(inp => { if (inp.id !== 'currencySelect') inp.disabled = true; });
            document.getElementById('addEmployeeBtn').disabled = true;
            document.getElementById('clearEmployeesBtn').disabled = true;
            renderEmployeeView();
        } else {
            const inputs = document.querySelectorAll('#salaryDashboard input, #salaryDashboard select');
            inputs.forEach(inp => inp.disabled = false);
            document.getElementById('addEmployeeBtn').disabled = false;
            document.getElementById('clearEmployeesBtn').disabled = false;
            renderTable();
        }
    }

    function loginUser() {
        const name = document.getElementById('loginName').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        if (!name) { errorDiv.innerText = '❌ Please enter your name'; return; }
        if (!password) { errorDiv.innerText = '❌ Password is required'; return; }

        if (name.toLowerCase() === 'admin' && password === '123') {
            currentUser = { name: 'Admin', role: 'admin' };
            errorDiv.innerText = '';
            showDashboard();
            fetchExchangeRates().then(() => renderTable());
        } else if (name.length >= 2) {
            currentUser = { name: name, role: 'employee' };
            errorDiv.innerText = '';
            showDashboard();
            fetchExchangeRates().then(() => renderEmployeeView());
        } else {
            errorDiv.innerText = 'Invalid credentials. Use Admin/123 or any name for employee.';
        }
    }

    function logout() {
        currentUser = null;
    
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('salaryDashboard').classList.add('hidden');
        document.getElementById('logoutRow').classList.add('hidden');
        document.getElementById('loginName').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').innerText = '';
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadEmployeesFromLocalStorage();  // Load saved data first
        fetchExchangeRates();
        
        document.getElementById('doLoginBtn').addEventListener('click', loginUser);
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('addEmployeeBtn').addEventListener('click', addEmployeeAsync);
        document.getElementById('clearEmployeesBtn').addEventListener('click', clearEmployees);
        
        document.getElementById('currencySelect').addEventListener('change', () => {
            if (currentUser?.role === 'employee') renderEmployeeView();
            else renderTable();
        });
        
        renderTable();
    });