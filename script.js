
const API_KEY = '041a549a3dd64838afb24653250708';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM 요소들
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');

// 이벤트 리스너
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// 페이지 로드 시 서울 날씨를 기본으로 표시
window.addEventListener('load', () => {
    getWeatherData('Seoul');
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('도시 이름을 입력해주세요.');
        return;
    }
    
    await getWeatherData(city);
}

async function getWeatherData(city) {
    try {
        showLoading(true);
        hideError();
        hideWeatherData();
        
        // 현재 날씨와 예보를 동시에 가져오기
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`),
            fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('도시를 찾을 수 없습니다.');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

function displayCurrentWeather(data) {
    const { location, current } = data;
    
    // 위치 정보
    document.getElementById('locationName').textContent = `${location.name}, ${location.country}`;
    document.getElementById('currentTime').textContent = `현지 시간: ${formatTime(location.localtime)}`;
    
    // 날씨 아이콘
    document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
    document.getElementById('weatherIcon').alt = current.condition.text;
    
    // 온도 및 상태
    document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°C`;
    document.getElementById('condition').textContent = current.condition.text;
    
    // 상세 정보
    document.getElementById('feelsLike').textContent = `${Math.round(current.feelslike_c)}°C`;
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('wind').textContent = `${current.wind_kph} km/h ${getWindDirection(current.wind_dir)}`;
    document.getElementById('uv').textContent = getUVIndex(current.uv);
    
    currentWeather.classList.remove('hidden');
}

function displayForecast(data) {
    const forecastCards = document.getElementById('forecastCards');
    forecastCards.innerHTML = '';
    
    data.forecast.forecastday.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const date = index === 0 ? '오늘' : 
                    index === 1 ? '내일' : 
                    formatDate(day.date);
        
        card.innerHTML = `
            <div class="forecast-date">${date}</div>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
            <div class="forecast-temps">
                <div class="forecast-high">${Math.round(day.day.maxtemp_c)}°</div>
                <div class="forecast-low">${Math.round(day.day.mintemp_c)}°</div>
            </div>
        `;
        
        forecastCards.appendChild(card);
    });
    
    forecast.classList.remove('hidden');
}

function formatTime(localtime) {
    const date = new Date(localtime);
    return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
}

function getWindDirection(dir) {
    const directions = {
        'N': '북', 'NE': '북동', 'E': '동', 'SE': '남동',
        'S': '남', 'SW': '남서', 'W': '서', 'NW': '북서'
    };
    return directions[dir] || dir;
}

function getUVIndex(uv) {
    if (uv <= 2) return `${uv} (낮음)`;
    if (uv <= 5) return `${uv} (보통)`;
    if (uv <= 7) return `${uv} (높음)`;
    if (uv <= 10) return `${uv} (매우 높음)`;
    return `${uv} (위험)`;
}

function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function hideWeatherData() {
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
}
