const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2wA_oOZYxnWtB3oh-mHpKaIphx-WgPiSaLuPE8vsa6xcUdikiXt63k9BENV14o6hn/exec';

const COUNT_KEY = 'sunrise4solution-project-price-calculator';
const COUNT_API_URL = `https://api.countapi.xyz/hit/${COUNT_KEY}`;
const COUNT_GET_URL = `https://api.countapi.xyz/get/${COUNT_KEY}`;

function getCountAPIWithProxy(url) {
    return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
}

const JSONBIN_BIN_ID = null;
const JSONBIN_API_KEY = null;

let hasTrackedThisSession = false;

async function trackExecution() {
    if (hasTrackedThisSession) {
        return;
    }
    hasTrackedThisSession = true;
    
    try {
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
            if (data && data.contents) {
                try {
                    const apiResponse = JSON.parse(data.contents);
                    if (apiResponse && apiResponse.value) {
                        localStorage.setItem('executionCount', apiResponse.value);
                        localStorage.setItem('executionCountTime', Date.now());
                        updateExecutionCountDisplay(apiResponse.value);
                    }
                } catch (e) {
                }
            }
        })
        .catch(() => {
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
                return null;
            })
            .then(data => {
                if (data && data.value) {
                    localStorage.setItem('executionCount', data.value);
                    localStorage.setItem('executionCountTime', Date.now());
                    updateExecutionCountDisplay(data.value);
                }
            })
            .catch(() => {
            });
        });
    } catch (error) {
        console.log('خطا در ثبت اجرا:', error);
    }
}

function updateExecutionCountDisplay(count) {
    let countDisplay = document.getElementById('executionCountDisplay');
    
    if (!countDisplay) {
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

function loadExecutionCount() {
    const savedCount = localStorage.getItem('executionCount');
    if (savedCount) {
        updateExecutionCountDisplay(parseInt(savedCount));
    }
    
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
            }
        }
        return fetch(COUNT_GET_URL, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
    })
    .then(response => {
        if (response && response.ok) {
            return response.json();
        }
        return null;
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
        if (savedCount) {
            updateExecutionCountDisplay(parseInt(savedCount));
        }
    });
}

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

const projectTypeMultipliers = {
    'web': 1.0,
    'mobile': 1.5,
    'desktop': 1.3,
    'ecommerce': 2.0,
    'cms': 1.2,
    'api': 1.1,
    'other': 1.0
};

const complexityMultipliers = {
    'simple': 0.7,
    'medium': 1.0,
    'complex': 1.5,
    'very-complex': 2.5
};

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

function formatNumber(num) {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
}

function calculateFeaturePrice(features) {
    let total = 0;
    const featureList = features.split('\n').filter(f => f.trim());
    
    featureList.forEach(feature => {
        const trimmedFeature = feature.trim();
        if (baseFeaturePrices[trimmedFeature]) {
            total += baseFeaturePrices[trimmedFeature];
        } else {
            for (const [key, value] of Object.entries(baseFeaturePrices)) {
                if (trimmedFeature.includes(key) || key.includes(trimmedFeature)) {
                    total += value;
                    break;
                }
            }
            if (!Object.keys(baseFeaturePrices).some(k => trimmedFeature.includes(k) || k.includes(trimmedFeature))) {
                total += 1500000;
            }
        }
    });
    
    return total;
}

function calculateTechnologyPrice(technologies) {
    let total = 0;
    const techList = technologies.split(',').map(t => t.trim());
    
    techList.forEach(tech => {
        if (technologyBasePrices[tech]) {
            total += technologyBasePrices[tech];
        } else {
            for (const [key, value] of Object.entries(technologyBasePrices)) {
                if (tech.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(tech.toLowerCase())) {
                    total += value;
                    break;
                }
            }
            if (!Object.keys(technologyBasePrices).some(k => 
                tech.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tech.toLowerCase()))) {
                total += 2000000;
            }
        }
    });
    
    return total;
}

function extractPriceFromText(text) {
    const tomanPatterns = [
        /(\d+(?:[,\s]\d+)*)\s*تومان/gi,
        /(\d+(?:[,\s]\d+)*)\s*ت\.?و\.?م\.?ا\.?ن/gi,
        /قیمت[:\s]+(\d+(?:[,\s]\d+)*)/gi,
        /هزینه[:\s]+(\d+(?:[,\s]\d+)*)/gi
    ];
    
    const dollarPatterns = [
        /\$(\d+(?:[,\s]\d+)*)/gi,
        /(\d+(?:[,\s]\d+)*)\s*دلار/gi,
        /USD[:\s]+(\d+(?:[,\s]\d+)*)/gi
    ];
    
    let prices = [];
    
    tomanPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const price = parseInt(match[1].replace(/[,\s]/g, ''));
            if (price > 100000 && price < 1000000000) {
                prices.push(price);
            }
        }
    });
    
    dollarPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const price = parseInt(match[1].replace(/[,\s]/g, ''));
            if (price > 100 && price < 100000) {
                prices.push(price * 50000);
            }
        }
    });
    
    return prices;
}

async function searchSimilarProjectsOnline(projectData) {
    const projectType = getProjectTypeEnglish(projectData.type);
    const techs = projectData.technologies.split(',').map(t => t.trim()).join(' ');
    const features = projectData.features.split('\n').slice(0, 3).map(f => f.trim()).join(' ');
    
    const searchQueries = [
        `ponisha ${projectType} ${techs}`,
        `jobinja ${projectType} ${techs}`,
        `${projectType} ${techs} price cost`,
        `${projectType} ${techs} development cost`
    ];
    
    const foundProjects = [];
    const seenPrices = new Set();
    
    for (const query of searchQueries) {
        let success = false;
        
        for (const proxy of CORS_PROXIES) {
            if (success) break;
            
            try {
                const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
                const proxyUrl = proxy + encodeURIComponent(searchUrl);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
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
                    if (html && html.length > 100) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
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
                                
                                const techsLower = techs.toLowerCase();
                                const hasMatchingTech = techsLower.split(' ').some(tech => 
                                    tech.length > 2 && fullText.includes(tech.toLowerCase())
                                );
                                
                                if (hasMatchingTech || title.length > 10) {
                                    let finalLink = link;
                                    let isFreelanceSite = false;
                                    
                                    if (link.includes('ponisha.ir') || link.includes('ponisha')) {
                                        finalLink = `https://ponisha.ir/search/projects?q=${encodeURIComponent(techs)}`;
                                        isFreelanceSite = true;
                                    } else if (link.includes('jobinja.ir') || link.includes('jobinja')) {
                                        finalLink = `https://jobinja.ir/jobs?q=${encodeURIComponent(techs)}`;
                                        isFreelanceSite = true;
                                    } else if (!link || link === '#' || link.startsWith('#')) {
                                        finalLink = `https://ponisha.ir/search/projects?q=${encodeURIComponent(techs)}`;
                                        isFreelanceSite = true;
                                    }
                                    
                                    const prices = extractPriceFromText(title + ' ' + snippet);
                                    
                                    if (prices.length > 0) {
                                        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                                        const priceKey = Math.round(avgPrice / 1000000);
                                        
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
                                success = true;
                            }
                        }
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (foundProjects.length >= 2) break;
    }
    
    return foundProjects;
}

function estimatePriceFromDescription(text, projectData) {
    const textLower = text.toLowerCase();
    let basePrice = 5000000;
    
    if (textLower.includes('simple') || textLower.includes('basic') || textLower.includes('ساده')) {
        basePrice = 8000000;
    } else if (textLower.includes('complex') || textLower.includes('advanced') || textLower.includes('پیچیده')) {
        basePrice = 25000000;
    } else if (textLower.includes('enterprise') || textLower.includes('enterprise')) {
        basePrice = 50000000;
    }
    
    const typeMultiplier = projectTypeMultipliers[projectData.type] || 1.0;
    basePrice *= typeMultiplier;
    
    return basePrice;
}

function generateFallbackProjects(projectData) {
    const basePrice = calculateBasePrice(projectData);
    const projectType = getProjectTypeName(projectData.type);
    const techs = projectData.technologies.split(',').map(t => t.trim());
    
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
    
    const links = freelanceLinks.map(fl => {
        if (fl.search) {
            return `${fl.url}?q=${fl.search}`;
        }
        return fl.url;
    });
    
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

async function findSimilarProjects(projectData) {
    try {
        const searchPromise = searchSimilarProjectsOnline(projectData);
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve([]), 5000);
        });
        
        const onlineProjects = await Promise.race([searchPromise, timeoutPromise]);
        
        if (onlineProjects.length < 2) {
            const fallbackProjects = generateFallbackProjects(projectData);
            return [...onlineProjects, ...fallbackProjects].slice(0, 3);
        }
        
        return onlineProjects.slice(0, 3);
    } catch (error) {
        return generateFallbackProjects(projectData);
    }
}

function calculatePrice(projectData, similarProjects = []) {
    const marketProjects = similarProjects.filter(p => 
        p.source === 'web search' || p.source === 'estimated'
    );
    const calculatedProjects = similarProjects.filter(p => 
        p.source === 'محاسبه شده'
    );
    
    let basePrice;
    
    if (marketProjects.length > 0) {
        const marketPrices = marketProjects
            .filter(p => p.price > 0)
            .map(p => p.price);
        
        if (marketPrices.length > 0) {
            const avgMarketPrice = marketPrices.reduce((a, b) => a + b, 0) / marketPrices.length;
            const calculatedPrice = calculateBasePrice(projectData);
            basePrice = (avgMarketPrice * 0.85) + (calculatedPrice * 0.15);
        } else {
            basePrice = calculateBasePrice(projectData);
        }
    } 
    else if (calculatedProjects.length > 0) {
        const calculatedPrices = calculatedProjects
            .filter(p => p.price > 0)
            .map(p => p.price);
        
        if (calculatedPrices.length > 0) {
            const avgCalculatedPrice = calculatedPrices.reduce((a, b) => a + b, 0) / calculatedPrices.length;
            const newCalculatedPrice = calculateBasePrice(projectData);
            basePrice = (avgCalculatedPrice * 0.9) + (newCalculatedPrice * 0.1);
        } else {
            basePrice = calculateBasePrice(projectData);
        }
    } 
    else {
        basePrice = calculateBasePrice(projectData);
    }
    
    const timelineMultiplier = 1 + (4 - projectData.timeline) * 0.05;
    basePrice *= Math.max(0.9, Math.min(1.15, timelineMultiplier));
    
    const teamMultiplier = 1 + (projectData.teamSize - 1) * 0.1;
    basePrice *= teamMultiplier;
    
    const experienceMultipliers = {
        'junior': 0.7,
        'mid': 1.0,
        'senior': 1.3,
        'expert': 1.6
    };
    const experienceMultiplier = experienceMultipliers[projectData.experience] || 1.0;
    basePrice *= experienceMultiplier;
    
    const projectsCountMultipliers = {
        'few': 0.8,
        'medium': 1.0,
        'many': 1.2,
        'expert': 1.4
    };
    const projectsCountMultiplier = projectsCountMultipliers[projectData.projectsCount] || 1.0;
    basePrice *= projectsCountMultiplier;
    
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

async function saveToGoogleSheets(userData, projectData, prices) {
    try {
        const dataToSave = {
            timestamp: new Date().toLocaleString('fa-IR'),
            userName: userData.name || '',
            userPhone: userData.phone || '',
            userEmail: userData.email || '',
            projectType: getProjectTypeName(projectData.type),
            technologies: projectData.technologies,
            features: projectData.features.replace(/\n/g, ' | '),
            complexity: getComplexityName(projectData.complexity),
            timeline: projectData.timeline + ' ماه',
            teamSize: projectData.teamSize + ' نفر',
            experience: getExperienceName(projectData.experience),
            projectsCount: getProjectsCountName(projectData.projectsCount),
            additionalInfo: projectData.additionalInfo || '',
            minPrice: formatNumber(prices.min),
            recommendedPrice: formatNumber(prices.recommended),
            maxPrice: formatNumber(prices.max)
        };

        // استفاده از fetch با no-cors برای Google Apps Script
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave)
        });

        console.log('داده‌ها به Google Sheets ارسال شد');
        return true;
    } catch (error) {
        console.error('خطا در ارسال به Google Sheets:', error);
        return false;
    }
}

function displayResults(projectData, prices, similarProjects) {
    const resultsDiv = document.getElementById('results');
    const minPriceDiv = document.getElementById('minPrice');
    const recommendedPriceDiv = document.getElementById('recommendedPrice');
    const maxPriceDiv = document.getElementById('maxPrice');
    const analysisDiv = document.getElementById('analysis');
    const similarProjectsDiv = document.getElementById('similarProjects');
    
    minPriceDiv.textContent = formatNumber(prices.min);
    recommendedPriceDiv.textContent = formatNumber(prices.recommended);
    maxPriceDiv.textContent = formatNumber(prices.max);
    
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
    
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

function getComplexityName(complexity) {
    const names = {
        'simple': 'ساده',
        'medium': 'متوسط',
        'complex': 'پیچیده',
        'very-complex': 'خیلی پیچیده'
    };
    return names[complexity] || complexity;
}

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
// window.addEventListener('DOMContentLoaded', function() {
//     loadExecutionCount();
// });

// هندل کردن ارسال فرم
document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // بررسی شماره تماس (الزامی)
    const userPhone = document.getElementById('userPhone').value.trim();
    if (!userPhone || userPhone.length < 10) {
        alert('⚠️ لطفاً شماره تماس معتبر وارد کنید (حداقل 10 رقم)');
        document.getElementById('userPhone').focus();
        return;
    }
    
    // جمع‌آوری اطلاعات کاربر
    const userData = {
        name: document.getElementById('userName').value.trim(),
        phone: userPhone,
        email: document.getElementById('userEmail').value.trim()
    };
    
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
    
    // جمع‌آوری داده‌های پروژه
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
            
            const prices = calculatePrice(projectData, similarProjects);
            
            // ذخیره در Google Sheets
            updateLoading('در حال ذخیره اطلاعات...');
            await saveToGoogleSheets(userData, projectData, prices);
            
            const loading = resultsDiv.querySelector('#loadingIndicator');
            if (loading) loading.remove();
            
            if (priceRange) priceRange.style.display = '';
            if (analysisSection) analysisSection.style.display = '';
            if (similarProjectsSection) similarProjectsSection.style.display = '';
            if (resetBtn) resetBtn.style.display = '';
            
            displayResults(projectData, prices, similarProjects);
        } catch (error) {
            updateLoading('در حال محاسبه بر اساس الگوریتم...');
            
            setTimeout(async () => {
                const loading = resultsDiv.querySelector('#loadingIndicator');
                if (loading) loading.remove();
                
                if (priceRange) priceRange.style.display = '';
                if (analysisSection) analysisSection.style.display = '';
                if (similarProjectsSection) similarProjectsSection.style.display = '';
                if (resetBtn) resetBtn.style.display = '';
                
                const fallbackProjects = generateFallbackProjects(projectData);
                const prices = calculatePrice(projectData, fallbackProjects);
                
                // ذخیره در Google Sheets حتی در صورت خطا
                await saveToGoogleSheets(userData, projectData, prices);
                
                displayResults(projectData, prices, fallbackProjects);
            }, 500);
        }
    })();
});

