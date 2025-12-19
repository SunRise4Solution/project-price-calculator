 // ایجنت جستجوی پروژه‌های مشابه از اینترنت
// استفاده از CORS proxy برای دسترسی به APIهای خارجی
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

// سیستم شمارش تعداد اجراها
// استفاده از CountAPI برای آمار کلی همه کاربران
const COUNT_API_KEY = 'sunrise4solution-project-price-calculator';
const COUNT_API_URL = `https://api.countapi.xyz/hit/${COUNT_API_KEY}`;
const COUNT_GET_URL = `https://api.countapi.xyz/get/${COUNT_API_KEY}`;

// استفاده از CORS proxy برای CountAPI
function getCountAPIWithProxy(url) {
    // استفاده از allorigins که معمولاً بهتر کار می‌کند
    return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
}

// بررسی اینکه آیا قبلاً در این session ثبت شده یا نه (برای جلوگیری از ثبت تکراری)
let hasTrackedThisSession = false;

// ثبت یک اجرای جدید (فقط یک بار در هر session)
async function trackExecution() {
    // جلوگیری از ثبت تکراری در یک session
    if (hasTrackedThisSession) {
        return;
    }
    hasTrackedThisSession = true;
    
    try {
        // ثبت در CountAPI - ابتدا تلاش مستقیم
        fetch(COUNT_API_URL, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Direct fetch failed');
        })
        .then(data => {
            if (data && data.value) {
                // ذخیره در localStorage برای نمایش سریع
                localStorage.setItem('executionCount', data.value);
                localStorage.setItem('executionCountTime', Date.now());
                updateExecutionCountDisplay(data.value);
            }
        })
        .catch(() => {
            // اگر مستقیم کار نکرد، از proxy استفاده می‌کنیم
            const proxyUrl = getCountAPIWithProxy(COUNT_API_URL);
            
            fetch(proxyUrl, {
                method: 'GET',
                mode: 'cors'
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return null;
            })
            .then(data => {
                // allorigins پاسخ را در contents برمی‌گرداند
                if (data && data.contents) {
                    try {
                        const apiResponse = JSON.parse(data.contents);
                        if (apiResponse && apiResponse.value) {
                            localStorage.setItem('executionCount', apiResponse.value);
                            localStorage.setItem('executionCountTime', Date.now());
                            updateExecutionCountDisplay(apiResponse.value);
                        }
                    } catch (e) {
                        // parse نشد
                    }
                }
            })
            .catch(() => {
                // همه روش‌ها شکست خوردند
            });
        });
    } catch (error) {
        // خطا را نادیده می‌گیریم تا تجربه کاربری مختل نشود
        console.log('خطا در ثبت اجرا:', error);
    }
}

// نمایش تعداد اجراها در صفحه
function updateExecutionCountDisplay(count) {
    // بررسی اینکه آیا قبلاً نمایش داده شده یا نه
    let countDisplay = document.getElementById('executionCountDisplay');
    
    if (!countDisplay) {
        // ایجاد عنصر نمایش
        countDisplay = document.createElement('div');
        countDisplay.id = 'executionCountDisplay';
        countDisplay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            font-size: 0.9em;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: bold;
        `;
        document.body.appendChild(countDisplay);
    }
    
    countDisplay.innerHTML = `📊 تعداد استفاده: ${formatNumber(count)}`;
}

// بارگذاری تعداد اجراها در ابتدای صفحه (آمار کلی از سرور)
function loadExecutionCount() {
    // نمایش مقدار localStorage به عنوان placeholder (در صورت وجود)
    const savedCount = localStorage.getItem('executionCount');
    if (savedCount) {
        updateExecutionCountDisplay(parseInt(savedCount));
    }
    
    // دریافت تعداد واقعی از API - ابتدا تلاش مستقیم
    fetch(COUNT_GET_URL, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Direct fetch failed');
    })
    .then(data => {
        if (data && data.value !== undefined) {
            localStorage.setItem('executionCount', data.value);
            localStorage.setItem('executionCountTime', Date.now());
            updateExecutionCountDisplay(data.value);
        } else if (savedCount) {
            updateExecutionCountDisplay(parseInt(savedCount));
        }
    })
    .catch(() => {
        // اگر مستقیم کار نکرد، از proxy استفاده می‌کنیم
        const proxyUrl = getCountAPIWithProxy(COUNT_GET_URL);
        
        fetch(proxyUrl, {
            method: 'GET',
            mode: 'cors'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Proxy fetch failed');
        })
        .then(data => {
            // allorigins پاسخ را در contents برمی‌گرداند
            if (data && data.contents) {
                try {
                    const apiResponse = JSON.parse(data.contents);
                    if (apiResponse && apiResponse.value !== undefined) {
                        localStorage.setItem('executionCount', apiResponse.value);
                        localStorage.setItem('executionCountTime', Date.now());
                        updateExecutionCountDisplay(apiResponse.value);
                        return;
                    }
                } catch (e) {
                    // parse نشد
                }
            }
            // اگر parse نشد، از localStorage استفاده می‌کنیم
            if (savedCount) {
                updateExecutionCountDisplay(parseInt(savedCount));
            }
        })
        .catch(() => {
            // همه روش‌ها شکست خوردند - از localStorage استفاده می‌کنیم
            if (savedCount) {
                updateExecutionCountDisplay(parseInt(savedCount));
            }
        });
    });
}

// تبدیل نام نوع پروژه به انگلیسی برای جستجو
function getProjectTypeEnglish(type) {
    const types = {
        'web': 'website',
        'mobile': 'mobile app',
        'desktop': 'desktop application',
        'ecommerce': 'ecommerce website',
        'cms': 'content management system',
        'api': 'API backend',
        'other': 'software project'
    };
    return types[type] || 'software project';
}

// ضریب‌های قیمت بر اساس نوع پروژه
const projectTypeMultipliers = {
    'web': 1.0,
    'mobile': 1.5,
    'desktop': 1.3,
    'ecommerce': 2.0,
    'cms': 1.2,
    'api': 1.1,
    'other': 1.0
};

// ضریب‌های پیچیدگی
const complexityMultipliers = {
    'simple': 0.7,
    'medium': 1.0,
    'complex': 1.5,
    'very-complex': 2.5
};

// قیمت پایه برای هر فیچر (تومان)
const baseFeaturePrices = {
    'احراز هویت': 2000000,
    'پنل مدیریت': 3000000,
    'پرداخت آنلاین': 5000000,
    'گزارش‌گیری': 2000000,
    'CMS': 3000000,
    'بلاگ': 1500000,
    'نقشه': 3000000,
    'اعلان': 1500000,
    'چت': 2500000,
    'جستجو پیشرفته': 2000000,
    'فیلتر': 1500000,
    'داشبورد': 2500000
};

// قیمت پایه برای هر تکنولوژی (تومان)
const technologyBasePrices = {
    'React': 3000000,
    'Vue.js': 2500000,
    'Angular': 3500000,
    'Node.js': 4000000,
    'Laravel': 3000000,
    'Django': 3500000,
    'MongoDB': 2000000,
    'PostgreSQL': 2500000,
    'MySQL': 1500000,
    'Firebase': 3000000,
    'React Native': 4000000,
    'Flutter': 4500000,
    'Swift': 5000000,
    'Kotlin': 5000000
};

// فرمت کردن اعداد فارسی
function formatNumber(num) {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
}

// محاسبه قیمت بر اساس فیچرها
function calculateFeaturePrice(features) {
    let total = 0;
    const featureList = features.split('\n').filter(f => f.trim());
    
    featureList.forEach(feature => {
        const trimmedFeature = feature.trim();
        // جستجوی دقیق
        if (baseFeaturePrices[trimmedFeature]) {
            total += baseFeaturePrices[trimmedFeature];
        } else {
            // جستجوی جزئی
            for (const [key, value] of Object.entries(baseFeaturePrices)) {
                if (trimmedFeature.includes(key) || key.includes(trimmedFeature)) {
                    total += value;
                    break;
                }
            }
            // اگر پیدا نشد، قیمت پیش‌فرض
            if (!Object.keys(baseFeaturePrices).some(k => trimmedFeature.includes(k) || k.includes(trimmedFeature))) {
                total += 1500000; // قیمت پیش‌فرض برای فیچرهای ناشناخته
            }
        }
    });
    
    return total;
}

// محاسبه قیمت بر اساس تکنولوژی‌ها
function calculateTechnologyPrice(technologies) {
    let total = 0;
    const techList = technologies.split(',').map(t => t.trim());
    
    techList.forEach(tech => {
        // جستجوی دقیق
        if (technologyBasePrices[tech]) {
            total += technologyBasePrices[tech];
        } else {
            // جستجوی جزئی
            for (const [key, value] of Object.entries(technologyBasePrices)) {
                if (tech.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(tech.toLowerCase())) {
                    total += value;
                    break;
                }
            }
            // اگر پیدا نشد، قیمت پیش‌فرض
            if (!Object.keys(technologyBasePrices).some(k => 
                tech.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tech.toLowerCase()))) {
                total += 2000000; // قیمت پیش‌فرض برای تکنولوژی‌های ناشناخته
            }
        }
    });
    
    return total;
}

// استخراج قیمت از متن
function extractPriceFromText(text) {
    // جستجوی قیمت به تومان
    const tomanPatterns = [
        /(\d+(?:[,\s]\d+)*)\s*تومان/gi,
        /(\d+(?:[,\s]\d+)*)\s*ت\.?و\.?م\.?ا\.?ن/gi,
        /قیمت[:\s]+(\d+(?:[,\s]\d+)*)/gi,
        /هزینه[:\s]+(\d+(?:[,\s]\d+)*)/gi
    ];
    
    // جستجوی قیمت به دلار
    const dollarPatterns = [
        /\$(\d+(?:[,\s]\d+)*)/gi,
        /(\d+(?:[,\s]\d+)*)\s*دلار/gi,
        /USD[:\s]+(\d+(?:[,\s]\d+)*)/gi
    ];
    
    let prices = [];
    
    // استخراج قیمت‌های تومان
    tomanPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const price = parseInt(match[1].replace(/[,\s]/g, ''));
            if (price > 100000 && price < 1000000000) { // محدوده منطقی
                prices.push(price);
            }
        }
    });
    
    // استخراج قیمت‌های دلار و تبدیل به تومان (1 دلار = 50000 تومان)
    dollarPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const price = parseInt(match[1].replace(/[,\s]/g, ''));
            if (price > 100 && price < 100000) { // محدوده منطقی
                prices.push(price * 50000); // تبدیل به تومان
            }
        }
    });
    
    return prices;
}

// جستجوی پروژه‌های مشابه از اینترنت
async function searchSimilarProjectsOnline(projectData) {
    const projectType = getProjectTypeEnglish(projectData.type);
    const techs = projectData.technologies.split(',').map(t => t.trim()).join(' ');
    const features = projectData.features.split('\n').slice(0, 3).map(f => f.trim()).join(' ');
    
    // ساخت کوئری جستجو - شامل جستجو در سایت‌های فریلنسری
    const searchQueries = [
        `ponisha ${projectType} ${techs}`,
        `jobinja ${projectType} ${techs}`,
        `${projectType} ${techs} price cost`,
        `${projectType} ${techs} development cost`
    ];
    
    const foundProjects = [];
    const seenPrices = new Set();
    
    // جستجو در چند منبع - با مدیریت خطای بهتر
    for (const query of searchQueries) {
        let success = false;
        
        // تلاش با چند proxy مختلف
        for (const proxy of CORS_PROXIES) {
            if (success) break;
            
            try {
                // استفاده از DuckDuckGo HTML (بدون نیاز به API key)
                const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
                const proxyUrl = proxy + encodeURIComponent(searchUrl);
                
                // استفاده از AbortController برای timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // کاهش timeout
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html'
                    },
                    signal: controller.signal
                }).catch(err => {
                    clearTimeout(timeoutId);
                    throw err;
                });
                
                clearTimeout(timeoutId);
            
                if (response && response.ok) {
                    const html = await response.text();
                    if (html && html.length > 100) { // بررسی اینکه HTML معتبر است
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        // استخراج لینک‌ها و توضیحات
                        const results = doc.querySelectorAll('.result, .web-result, .links_main, .result__body');
                        
                        if (results.length > 0) {
                            for (const result of Array.from(results).slice(0, 5)) {
                                const titleEl = result.querySelector('.result__a, .web-result__title, .result__title, a');
                                const snippetEl = result.querySelector('.result__snippet, .web-result__snippet, .result__body');
                                
                                const title = titleEl?.textContent?.trim() || '';
                                const snippet = snippetEl?.textContent?.trim() || '';
                                const link = titleEl?.href || result.querySelector('a')?.href || '';
                                
                                if (!title && !snippet) continue;
                                
                                const fullText = (title + ' ' + snippet).toLowerCase();
                                
                                // بررسی تطابق با تکنولوژی‌ها
                                const techsLower = techs.toLowerCase();
                                const hasMatchingTech = techsLower.split(' ').some(tech => 
                                    tech.length > 2 && fullText.includes(tech.toLowerCase())
                                );
                                
                                if (hasMatchingTech || title.length > 10) {
                                    // بررسی اینکه آیا لینک به سایت فریلنسری است
                                    let finalLink = link;
                                    let isFreelanceSite = false;
                                    
                                    if (link.includes('ponisha.ir') || link.includes('ponisha')) {
                                        finalLink = `https://ponisha.ir/search/projects?q=${encodeURIComponent(techs)}`;
                                        isFreelanceSite = true;
                                    } else if (link.includes('jobinja.ir') || link.includes('jobinja')) {
                                        finalLink = `https://jobinja.ir/jobs?q=${encodeURIComponent(techs)}`;
                                        isFreelanceSite = true;
                                    } else if (!link || link === '#' || link.startsWith('#')) {
                                        // اگر لینک معتبر نیست، لینک جستجو بساز
                                        finalLink = `https://ponisha.ir/search/projects?q=${encodeURIComponent(techs)}`;
                                        isFreelanceSite = true;
                                    }
                                    
                                    // استخراج قیمت
                                    const prices = extractPriceFromText(title + ' ' + snippet);
                                    
                                    if (prices.length > 0) {
                                        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                                        const priceKey = Math.round(avgPrice / 1000000); // گروه‌بندی بر اساس میلیون
                                        
                                        if (!seenPrices.has(priceKey) && avgPrice > 1000000) {
                                            seenPrices.add(priceKey);
                                            foundProjects.push({
                                                title: title.substring(0, 100),
                                                description: snippet.substring(0, 200) || title.substring(0, 150),
                                                price: avgPrice,
                                                link: finalLink,
                                                source: isFreelanceSite ? 'web search (freelance)' : 'web search',
                                                similarityScore: hasMatchingTech ? 70 : 50,
                                                externalLink: true
                                            });
                                        }
                                    } else {
                                        // اگر قیمت پیدا نشد، از محاسبه استفاده می‌کنیم
                                        const estimatedPrice = estimatePriceFromDescription(title + ' ' + snippet, projectData);
                                        if (estimatedPrice > 0) {
                                            foundProjects.push({
                                                title: title.substring(0, 100),
                                                description: snippet.substring(0, 200) || title.substring(0, 150),
                                                price: estimatedPrice,
                                                link: finalLink,
                                                source: isFreelanceSite ? 'estimated (freelance)' : 'estimated',
                                                similarityScore: hasMatchingTech ? 60 : 40,
                                                externalLink: true
                                            });
                                        }
                                    }
                                }
                            }
                            
                            if (foundProjects.length > 0) {
                                success = true; // موفقیت‌آمیز بود
                            }
                        }
                    }
                }
            } catch (error) {
                // خطا را نادیده می‌گیریم و به proxy بعدی می‌رویم
                continue;
            }
        }
        
        // اگر یک کوئری موفق بود، نیازی به ادامه نیست
        if (foundProjects.length >= 2) break;
    }
    
    // همیشه حداقل پروژه‌های fallback را برمی‌گردانیم
    return foundProjects;
}

// تخمین قیمت از توضیحات
function estimatePriceFromDescription(text, projectData) {
    const textLower = text.toLowerCase();
    let basePrice = 5000000;
    
    // بررسی کلمات کلیدی قیمت
    if (textLower.includes('simple') || textLower.includes('basic') || textLower.includes('ساده')) {
        basePrice = 8000000;
    } else if (textLower.includes('complex') || textLower.includes('advanced') || textLower.includes('پیچیده')) {
        basePrice = 25000000;
    } else if (textLower.includes('enterprise') || textLower.includes('enterprise')) {
        basePrice = 50000000;
    }
    
    // تطبیق با نوع پروژه
    const typeMultiplier = projectTypeMultipliers[projectData.type] || 1.0;
    basePrice *= typeMultiplier;
    
    return basePrice;
}

// تولید پروژه‌های جایگزین بر اساس محاسبه با لینک‌های واقعی
function generateFallbackProjects(projectData) {
    const basePrice = calculateBasePrice(projectData);
    const projectType = getProjectTypeName(projectData.type);
    const techs = projectData.technologies.split(',').map(t => t.trim());
    
    // لینک‌های واقعی به سایت‌های فریلنسری و نمونه کارها
    const freelanceLinks = [
        {
            name: 'Ponisha (پونیشا)',
            url: 'https://ponisha.ir/search/projects',
            search: encodeURIComponent(`${projectType} ${techs[0] || ''}`)
        },
        {
            name: 'Jobinja (جابینجا)',
            url: 'https://jobinja.ir/jobs',
            search: encodeURIComponent(`${projectType} ${techs[0] || ''}`)
        },
        {
            name: 'Divar (دیوار)',
            url: 'https://divar.ir/s/tehran/web-services',
            search: ''
        }
    ];
    
    // ساخت لینک‌های جستجو
    const links = freelanceLinks.map(fl => {
        if (fl.search) {
            return `${fl.url}?q=${fl.search}`;
        }
        return fl.url;
    });
    
    // ساخت لینک جستجو با تکنولوژی‌ها
    const techQuery = encodeURIComponent(techs.join(' '));
    
    return [
        {
            title: `${projectType} با ${techs[0] || 'تکنولوژی‌های مدرن'}`,
            description: `پروژه ${projectType} با استفاده از ${techs.join(' و ')}`,
            price: basePrice * 0.8,
            link: `https://ponisha.ir/search/projects?q=${techQuery}`,
            source: 'محاسبه شده',
            similarityScore: 80,
            externalLink: true
        },
        {
            title: `${projectType} مشابه`,
            description: `پروژه مشابه با ${projectData.complexity === 'complex' ? 'پیچیدگی بالا' : 'پیچیدگی متوسط'}`,
            price: basePrice * 1.2,
            link: `https://jobinja.ir/jobs?q=${techQuery}`,
            source: 'محاسبه شده',
            similarityScore: 70,
            externalLink: true
        },
        {
            title: `جستجوی پروژه‌های مشابه`,
            description: `می‌توانید در سایت‌های فریلنسری جستجو کنید`,
            price: 0,
            link: `https://ponisha.ir/search/projects?q=${techQuery}`,
            source: 'لینک جستجو',
            similarityScore: 50,
            externalLink: true
        }
    ];
}

// محاسبه قیمت پایه
function calculateBasePrice(projectData) {
    let basePrice = 5000000;
    basePrice += calculateFeaturePrice(projectData.features);
    basePrice += calculateTechnologyPrice(projectData.technologies);
    const typeMultiplier = projectTypeMultipliers[projectData.type] || 1.0;
    basePrice *= typeMultiplier;
    const complexityMultiplier = complexityMultipliers[projectData.complexity] || 1.0;
    basePrice *= complexityMultiplier;
    return basePrice;
}

// پیدا کردن پروژه‌های مشابه (تابع اصلی)
async function findSimilarProjects(projectData) {
    try {
        // جستجوی آنلاین با timeout
        const searchPromise = searchSimilarProjectsOnline(projectData);
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve([]), 5000); // حداکثر 5 ثانیه
        });
        
        const onlineProjects = await Promise.race([searchPromise, timeoutPromise]);
        
        // اگر نتایج کافی پیدا نشد، از محاسبه استفاده می‌کنیم
        if (onlineProjects.length < 2) {
            const fallbackProjects = generateFallbackProjects(projectData);
            // ترکیب نتایج آنلاین با fallback
            return [...onlineProjects, ...fallbackProjects].slice(0, 3);
        }
        
        return onlineProjects.slice(0, 3);
    } catch (error) {
        // در صورت خطا، از محاسبه استفاده می‌کنیم
        return generateFallbackProjects(projectData);
    }
}

// محاسبه قیمت نهایی بر اساس نتایج جستجو و محاسبات
function calculatePrice(projectData, similarProjects = []) {
    // بررسی اینکه آیا پروژه‌های واقعی از بازار پیدا شده‌اند
    const marketProjects = similarProjects.filter(p => 
        p.source === 'web search' || p.source === 'estimated'
    );
    const calculatedProjects = similarProjects.filter(p => 
        p.source === 'محاسبه شده'
    );
    
    let basePrice;
    
    // اگر پروژه‌های واقعی از بازار پیدا شدند، اولویت با آنهاست
    if (marketProjects.length > 0) {
        const marketPrices = marketProjects
            .filter(p => p.price > 0)
            .map(p => p.price);
        
        if (marketPrices.length > 0) {
            const avgMarketPrice = marketPrices.reduce((a, b) => a + b, 0) / marketPrices.length;
            const calculatedPrice = calculateBasePrice(projectData);
            // 85% بازار، 15% محاسبه
            basePrice = (avgMarketPrice * 0.85) + (calculatedPrice * 0.15);
        } else {
            basePrice = calculateBasePrice(projectData);
        }
    } 
    // اگر فقط پروژه‌های محاسبه شده داریم، از میانگین آنها استفاده می‌کنیم
    else if (calculatedProjects.length > 0) {
        const calculatedPrices = calculatedProjects
            .filter(p => p.price > 0)
            .map(p => p.price);
        
        if (calculatedPrices.length > 0) {
            const avgCalculatedPrice = calculatedPrices.reduce((a, b) => a + b, 0) / calculatedPrices.length;
            // 90% قیمت‌های محاسبه شده مشابه، 10% محاسبه جدید
            const newCalculatedPrice = calculateBasePrice(projectData);
            basePrice = (avgCalculatedPrice * 0.9) + (newCalculatedPrice * 0.1);
        } else {
            basePrice = calculateBasePrice(projectData);
        }
    } 
    // اگر هیچ پروژه مشابهی پیدا نشد
    else {
        basePrice = calculateBasePrice(projectData);
    }
    
    // اعمال ضریب زمان (هرچه زمان کمتر، قیمت بیشتر) - فقط برای تنظیمات نهایی
    const timelineMultiplier = 1 + (4 - projectData.timeline) * 0.05; // کاهش تاثیر
    basePrice *= Math.max(0.9, Math.min(1.15, timelineMultiplier));
    
    // اعمال ضریب تیم (هرچه تیم بزرگتر، قیمت بیشتر) - فقط برای تنظیمات نهایی
    const teamMultiplier = 1 + (projectData.teamSize - 1) * 0.1; // کاهش تاثیر
    basePrice *= teamMultiplier;
    
    // اعمال ضریب سابقه کار برنامه‌نویس
    const experienceMultipliers = {
        'junior': 0.7,      // کمتر از 2 سال - 30% تخفیف
        'mid': 1.0,         // 2 تا 5 سال - قیمت عادی
        'senior': 1.3,      // 5 تا 10 سال - 30% اضافه
        'expert': 1.6       // بیش از 10 سال - 60% اضافه
    };
    const experienceMultiplier = experienceMultipliers[projectData.experience] || 1.0;
    basePrice *= experienceMultiplier;
    
    // اعمال ضریب تعداد پروژه‌های ساخته شده
    const projectsCountMultipliers = {
        'few': 0.8,         // کمتر از 5 پروژه - 20% تخفیف
        'medium': 1.0,      // 5 تا 15 پروژه - قیمت عادی
        'many': 1.2,        // 15 تا 30 پروژه - 20% اضافه
        'expert': 1.4       // بیش از 30 پروژه - 40% اضافه
    };
    const projectsCountMultiplier = projectsCountMultipliers[projectData.projectsCount] || 1.0;
    basePrice *= projectsCountMultiplier;
    
    // محاسبه بازه قیمت - بازه کوچکتر برای دقت بیشتر
    const minPrice = basePrice * 0.75;
    const recommendedPrice = basePrice;
    const maxPrice = basePrice * 1.35;
    
    return {
        min: minPrice,
        recommended: recommendedPrice,
        max: maxPrice,
        marketBased: marketProjects.length > 0 || calculatedProjects.length > 0
    };
}

// نمایش نتایج
function displayResults(projectData, prices, similarProjects) {
    const resultsDiv = document.getElementById('results');
    const minPriceDiv = document.getElementById('minPrice');
    const recommendedPriceDiv = document.getElementById('recommendedPrice');
    const maxPriceDiv = document.getElementById('maxPrice');
    const analysisDiv = document.getElementById('analysis');
    const similarProjectsDiv = document.getElementById('similarProjects');
    
    // نمایش قیمت‌ها
    minPriceDiv.textContent = formatNumber(prices.min);
    recommendedPriceDiv.textContent = formatNumber(prices.recommended);
    maxPriceDiv.textContent = formatNumber(prices.max);
    
    // محاسبه تاثیر سابقه کار و تعداد پروژه
    const experienceMultipliers = {
        'junior': 0.7,
        'mid': 1.0,
        'senior': 1.3,
        'expert': 1.6
    };
    const projectsCountMultipliers = {
        'few': 0.8,
        'medium': 1.0,
        'many': 1.2,
        'expert': 1.4
    };
    
    const expMultiplier = experienceMultipliers[projectData.experience] || 1.0;
    const projMultiplier = projectsCountMultipliers[projectData.projectsCount] || 1.0;
    const totalMultiplier = expMultiplier * projMultiplier;
    const multiplierPercent = ((totalMultiplier - 1) * 100).toFixed(0);
    const multiplierText = totalMultiplier > 1 
        ? `+${multiplierPercent}%` 
        : totalMultiplier < 1 
        ? `${multiplierPercent}%` 
        : 'بدون تغییر';
    
    // نمایش تحلیل
    let analysisHTML = `
        <div class="analysis-item">
            <strong>نوع پروژه:</strong> ${getProjectTypeName(projectData.type)}
        </div>
        <div class="analysis-item">
            <strong>تکنولوژی‌ها:</strong> ${projectData.technologies}
        </div>
        <div class="analysis-item">
            <strong>سطح پیچیدگی:</strong> ${getComplexityName(projectData.complexity)}
        </div>
        <div class="analysis-item">
            <strong>زمان تحویل:</strong> ${projectData.timeline} ماه
        </div>
        <div class="analysis-item">
            <strong>تعداد توسعه‌دهندگان:</strong> ${projectData.teamSize} نفر
        </div>
        <div class="analysis-item">
            <strong>سابقه کار:</strong> ${getExperienceName(projectData.experience)} 
            <span style="color: ${expMultiplier > 1 ? '#28a745' : expMultiplier < 1 ? '#dc3545' : '#666'}; font-size: 0.9em;">
                (${expMultiplier > 1 ? '+' : ''}${((expMultiplier - 1) * 100).toFixed(0)}%)
            </span>
        </div>
        <div class="analysis-item">
            <strong>تعداد پروژه‌های ساخته شده:</strong> ${getProjectsCountName(projectData.projectsCount)}
            <span style="color: ${projMultiplier > 1 ? '#28a745' : projMultiplier < 1 ? '#dc3545' : '#666'}; font-size: 0.9em;">
                (${projMultiplier > 1 ? '+' : ''}${((projMultiplier - 1) * 100).toFixed(0)}%)
            </span>
        </div>
        <div class="analysis-item">
            <strong>تعداد فیچرها:</strong> ${projectData.features.split('\n').filter(f => f.trim()).length} مورد
        </div>
        <div class="analysis-item" style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-right: 4px solid #667eea;">
            <strong>تاثیر کل سابقه و تجربه:</strong> 
            <span style="color: ${totalMultiplier > 1 ? '#28a745' : totalMultiplier < 1 ? '#dc3545' : '#666'}; font-weight: bold; font-size: 1.1em;">
                ${multiplierText}
            </span>
        </div>
    `;
    
    analysisDiv.innerHTML = analysisHTML;
    
    // نمایش پروژه‌های مشابه
    if (similarProjects.length > 0) {
        let similarHTML = '';
        similarProjects.forEach(project => {
            let linkHTML = '';
            
            if (project.link && project.link !== '#') {
                if (project.externalLink) {
                    linkHTML = `<a href="${project.link}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 8px; padding: 5px 10px; background: #f0f0f0; border-radius: 5px;">🔗 مشاهده در ${project.link.includes('ponisha') ? 'پونیشا' : project.link.includes('jobinja') ? 'جابینجا' : project.link.includes('divar') ? 'دیوار' : 'سایت'} →</a>`;
                } else {
                    linkHTML = `<a href="${project.link}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 8px;">🔗 مشاهده منبع →</a>`;
                }
            }
            
            const priceDisplay = project.price > 0 
                ? `<p><strong>قیمت:</strong> ${formatNumber(project.price)} تومان</p>`
                : '';
            
            similarHTML += `
                <div class="similar-project">
                    <h4>${project.title || project.description || 'پروژه مشابه'}</h4>
                    ${priceDisplay}
                    ${project.description ? `<p><strong>توضیحات:</strong> ${project.description}</p>` : ''}
                    <p><strong>منبع:</strong> ${project.source === 'web search' ? '🔍 جستجوی اینترنت' : project.source === 'estimated' ? '📊 تخمین بر اساس توضیحات' : project.source === 'لینک جستجو' ? '🔗 لینک جستجو' : '🧮 ' + project.source}</p>
                    ${linkHTML}
                </div>
            `;
        });
        similarProjectsDiv.innerHTML = similarHTML;
    } else {
        similarProjectsDiv.innerHTML = '<p>پروژه مشابهی یافت نشد. در حال جستجو...</p>';
    }
    
    // نمایش نتایج
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// تبدیل نام نوع پروژه
function getProjectTypeName(type) {
    const names = {
        'web': 'وب سایت',
        'mobile': 'اپلیکیشن موبایل',
        'desktop': 'نرم‌افزار دسکتاپ',
        'ecommerce': 'فروشگاه آنلاین',
        'cms': 'سیستم مدیریت محتوا',
        'api': 'API و Backend',
        'other': 'سایر'
    };
    return names[type] || type;
}

// تبدیل نام پیچیدگی
function getComplexityName(complexity) {
    const names = {
        'simple': 'ساده',
        'medium': 'متوسط',
        'complex': 'پیچیده',
        'very-complex': 'خیلی پیچیده'
    };
    return names[complexity] || complexity;
}

// تبدیل نام سابقه کار
function getExperienceName(experience) {
    const names = {
        'junior': 'کمتر از 2 سال (Junior)',
        'mid': '2 تا 5 سال (Mid-level)',
        'senior': '5 تا 10 سال (Senior)',
        'expert': 'بیش از 10 سال (Expert)'
    };
    return names[experience] || experience;
}

// تبدیل نام تعداد پروژه
function getProjectsCountName(projectsCount) {
    const names = {
        'few': 'کمتر از 5 پروژه',
        'medium': '5 تا 15 پروژه',
        'many': '15 تا 30 پروژه',
        'expert': 'بیش از 30 پروژه'
    };
    return names[projectsCount] || projectsCount;
}

// ریست کردن فرم
function resetForm() {
    document.getElementById('projectForm').reset();
    document.getElementById('results').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// بارگذاری تعداد اجراها هنگام لود صفحه
window.addEventListener('DOMContentLoaded', function() {
    loadExecutionCount();
});

// هندل کردن ارسال فرم
document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ثبت یک اجرای جدید
    trackExecution();
    
    // نمایش لودینگ
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'در حال محاسبه...';
    loadingDiv.id = 'loadingIndicator';
    
    // پنهان کردن محتوای قبلی و نمایش لودینگ
    const priceRange = resultsDiv.querySelector('.price-range');
    const analysisSection = resultsDiv.querySelector('.analysis-section');
    const similarProjectsSection = resultsDiv.querySelector('.similar-projects-section');
    const resetBtn = resultsDiv.querySelector('.reset-btn');
    
    if (priceRange) priceRange.style.display = 'none';
    if (analysisSection) analysisSection.style.display = 'none';
    if (similarProjectsSection) similarProjectsSection.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    
    // حذف لودینگ قبلی اگر وجود دارد
    const existingLoading = resultsDiv.querySelector('#loadingIndicator');
    if (existingLoading) existingLoading.remove();
    
    resultsDiv.appendChild(loadingDiv);
    resultsDiv.classList.remove('hidden');
    
    // جمع‌آوری داده‌ها
    const projectData = {
        type: document.getElementById('projectType').value,
        technologies: document.getElementById('technologies').value,
        features: document.getElementById('features').value,
        complexity: document.getElementById('complexity').value,
        timeline: parseInt(document.getElementById('timeline').value),
        teamSize: parseInt(document.getElementById('teamSize').value),
        experience: document.getElementById('experience').value,
        projectsCount: document.getElementById('projectsCount').value,
        additionalInfo: document.getElementById('additionalInfo').value
    };
    
    // به‌روزرسانی پیام لودینگ
    const updateLoading = (message) => {
        const loading = resultsDiv.querySelector('#loadingIndicator');
        if (loading) loading.textContent = message;
    };
    
    // شروع فرآیند جستجو و محاسبه
    (async () => {
        try {
            updateLoading('در حال جستجوی پروژه‌های مشابه از اینترنت...');
            
            // پیدا کردن پروژه‌های مشابه از اینترنت (با fallback خودکار)
            const similarProjects = await findSimilarProjects(projectData);
            
            // اگر نتایج آنلاین پیدا نشد، از محاسبه استفاده می‌کنیم
            const hasOnlineResults = similarProjects.some(p => p.source === 'web search' || p.source === 'estimated');
            
            if (!hasOnlineResults) {
                updateLoading('استفاده از الگوریتم محاسبه قیمت...');
            } else {
                updateLoading('در حال محاسبه قیمت بر اساس نتایج بازار...');
            }
            
            // محاسبه قیمت بر اساس نتایج
            const prices = calculatePrice(projectData, similarProjects);
            
            // حذف لودینگ
            const loading = resultsDiv.querySelector('#loadingIndicator');
            if (loading) loading.remove();
            
            // نمایش مجدد بخش‌ها
            if (priceRange) priceRange.style.display = '';
            if (analysisSection) analysisSection.style.display = '';
            if (similarProjectsSection) similarProjectsSection.style.display = '';
            if (resetBtn) resetBtn.style.display = '';
            
            // نمایش نتایج
            displayResults(projectData, prices, similarProjects);
        } catch (error) {
            // در صورت خطا، از محاسبه ساده استفاده می‌کنیم (بدون نمایش خطا به کاربر)
            updateLoading('در حال محاسبه بر اساس الگوریتم...');
            
            setTimeout(() => {
                const loading = resultsDiv.querySelector('#loadingIndicator');
                if (loading) loading.remove();
                
                if (priceRange) priceRange.style.display = '';
                if (analysisSection) analysisSection.style.display = '';
                if (similarProjectsSection) similarProjectsSection.style.display = '';
                if (resetBtn) resetBtn.style.display = '';
                
                const fallbackProjects = generateFallbackProjects(projectData);
                const prices = calculatePrice(projectData, fallbackProjects);
                displayResults(projectData, prices, fallbackProjects);
            }, 500);
        }
    })();
});

