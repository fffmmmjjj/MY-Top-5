const LOCAL_DATA_URL = 'data/top5_lists.json';
// ⚠️ 아래 주소를 본인의 n8n Webhook URL로 바꿔주세요.
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/a06ee3c2-025c-40c7-bc3f-64bb4427c3e7';
const GOOGLE_SHEET_ID = 'https://docs.google.com/spreadsheets/d/1q4smb0soyH3Uhiw-lVhl3RTryqevR-RhjSnHOijvPUA/edit?gid=1184122256#gid=1184122256';
const GOOGLE_SHEET_NAME = 'cai_data';

const AGE_RATINGS = ['전체이용가', '8세이상', '15세이상', '18세이상', '청소년 금지'];

let lists = [];

// DOM 요소들
let $lists, $search, $addBtn, $addModal, $addModalClose, $addForm, $addFormCancel;
let $itemsContainer, $detailModal, $detailModalClose, $detailModalOverlay, $detailContent;

function escapeHtml(str){
	return String(str)
		.replace(/&/g,'&amp;')
		.replace(/</g,'&lt;')
		.replace(/>/g,'&gt;')
		.replace(/"/g,'&quot;')
		.replace(/'/g,'&#39;');
}

function getTodayDate(){
	const today = new Date();
	return today.toISOString().split('T')[0];
}

function createItemInputs(){
	let html = '';
	for(let i = 1; i <= 5; i++){
		html += `
			<div class="item-group">
				<h4>${i}번</h4>
				<div class="item-input-group">
					<input type="text" class="item-title" placeholder="${i}번 제목" data-index="${i}" />
					<select class="item-age" data-index="${i}">
						${AGE_RATINGS.map(rating => `<option value="${rating}">${rating}</option>`).join('')}
					</select>
				</div>
			</div>
		`;
	}
	return html;
}

function openAddModal(){
	$itemsContainer.innerHTML = createItemInputs();
	$addForm.reset();
	$addModal.style.display = 'flex';
}

function closeAddModal(){
	$addModal.style.display = 'none';
}

function openDetailModal(item){
	const itemsHtml = (item.items || []).map((i, idx) => `
		<li>
			<span class="detail-item-title">${escapeHtml(i.title || i)}</span>
			<span class="detail-item-age">${escapeHtml(typeof i === 'string' ? '' : (i.ageRating || ''))}</span>
		</li>
	`).join('');

	const html = `
		<div class="detail-view">
			<h2>${escapeHtml(item.title)}</h2>
			<div class="detail-meta">
				<div class="detail-age">연령제한: ${escapeHtml((item.genre || ''))}</div>
			</div>
			<p class="detail-description">${escapeHtml(item.description || item.comment || '')}</p>
			<div class="detail-items">
				<h3>Top 5</h3>
				<ol>${itemsHtml}</ol>
			</div>
			<div class="detail-author">작성자: ${escapeHtml(item.author || '')}</div>
		</div>
	`;

	$detailContent.innerHTML = html;
	$detailModal.style.display = 'flex';
}

function closeDetailModal(){
	$detailModal.style.display = 'none';
}

async function loadData(){
	try{
		const saved = localStorage.getItem('top5_lists');
		if(saved){
			lists = JSON.parse(saved);
			lists.forEach(l=>{ if(l && l.hasOwnProperty('date')) delete l.date; });
			renderLists(lists);
			return;
		}
	}catch(e){
		console.warn('localStorage 로드 실패', e);
	}

	try{
		lists = await fetchData();
		renderLists(lists);
		return;
	}catch(e){
		console.warn('Google Sheets 로드 실패', e);
	}

	renderLists(lists);
}

function renderLists(items){
	$lists.innerHTML = '';
	if(items.length === 0){
		$lists.innerHTML = '<p>등록된 Top5 목록이 없습니다.</p>';
		return;
	}
	const frag = document.createDocumentFragment();
	items.forEach(item => {
		const card = document.createElement('article');
		card.className = 'card';
		card.setAttribute('role', 'button');
		card.setAttribute('tabindex', '0');
		card.innerHTML = `
			<h3>${escapeHtml(item.title)}</h3>
			${item.genre ? `<div class="card-genre">${escapeHtml(item.genre)}</div>` : ''}
			<p class="comment">${escapeHtml(item.description || item.comment || '')}</p>
			<button type="button" class="delete-button" aria-label="삭제">삭제</button>
		`;
		const deleteBtn = card.querySelector('.delete-button');
		deleteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			deleteItem(item.id);
		});
		card.addEventListener('click', () => openDetailModal(item));
		card.addEventListener('keypress', (e) => {
			if(e.key === 'Enter' || e.key === ' '){
				openDetailModal(item);
			}
		});
		frag.appendChild(card);
	});
	$lists.appendChild(frag);
}

function deleteItem(id){
	if(typeof id === 'undefined') return;
	lists = lists.filter(item => item.id !== id);
	try{
		localStorage.setItem('top5_lists', JSON.stringify(lists));
	}catch(e){
		console.warn('삭제 후 로컬 저장 실패:', e);
	}
	renderLists(lists);
}

async function fetchData(){
	const sheetId = normalizeGoogleSheetId(GOOGLE_SHEET_ID);
	if(sheetId){
		const url = getGoogleSheetCsvUrl(sheetId, GOOGLE_SHEET_NAME);
		const res = await fetch(url);
		if(!res.ok){
			console.warn('Google Sheets fetch 실패, fallback 사용:', url, res.status);
			return await loadLocalData();
		}
		const text = await res.text();
		return parseSheetCsv(text);
	}
	return await loadLocalData();
}

function loadLocalData(){
	return fetch(LOCAL_DATA_URL)
		.then(res => {
			if(!res.ok) throw new Error('로컬 JSON fetch 실패');
			return res.json();
		});
}

function normalizeGoogleSheetId(sheetIdOrUrl){
	if(!sheetIdOrUrl) return '';
	const urlPattern = /\/d\/([a-zA-Z0-9-_]+)(?:\/|$)/;
	const match = String(sheetIdOrUrl).match(urlPattern);
	if(match) return match[1];
	return String(sheetIdOrUrl).trim();
}

function getGoogleSheetCsvUrl(sheetId, sheetName='Sheet1'){
	return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseSheetCsv(csv){
	const rows = csv.trim().split(/\r?\n/).map(line =>
		line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(cell => cell.replace(/^"|"$/g,'').trim())
	);
	const headers = rows[0] || [];
	const headerIndex = headers.reduce((acc, name, idx) => {
		acc[name.trim().toLowerCase()] = idx;
		return acc;
	}, {});
	return rows.slice(1).filter(row => row.length > 1).map((row, rowIndex) => ({
		id: Number(row[headerIndex['id']]) || rowIndex + 1,
		author: row[headerIndex['author']] || '',
		title: row[headerIndex['title']] || '',
		genre: row[headerIndex['genre']] || '',
		description: row[headerIndex['description']] || '',
		items: [
			{ title: row[headerIndex['item1']] || '', ageRating: row[headerIndex['item1_age']] || '' },
			{ title: row[headerIndex['item2']] || '', ageRating: row[headerIndex['item2_age']] || '' },
			{ title: row[headerIndex['item3']] || '', ageRating: row[headerIndex['item3_age']] || '' },
			{ title: row[headerIndex['item4']] || '', ageRating: row[headerIndex['item4_age']] || '' },
			{ title: row[headerIndex['item5']] || '', ageRating: row[headerIndex['item5_age']] || '' }
		].filter(i => i.title),
		comment: row[headerIndex['comment']] || '',
		date: row[headerIndex['date']] || '',
	}));
}

function filterLists(q){
	const t = q.trim().toLowerCase();
	if(!t) return lists;
	return lists.filter(l=> (
		(l.title||'').toLowerCase().includes(t) ||
		(l.items||[]).map(i => typeof i === 'string' ? i : i.title).join(' ').toLowerCase().includes(t) ||
		(l.genre||'').toLowerCase().includes(t)
	));
}

function debounce(fn, wait=200){
	let t;
	return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

const onSearch = debounce((ev)=>{
	const q = ev.target.value || '';
	const filtered = filterLists(q);
	renderLists(filtered);
});

async function sendToN8n(payload){
	try{
		const response = await fetch(N8N_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if(!response.ok){
			console.warn('n8n webhook 전송 실패:', response.status, response.statusText);
			return false;
		}
		console.log('n8n webhook 전송 성공');
		return true;
	}catch(error){
		console.warn('n8n webhook 전송 오류:', error);
		return false;
	}
}

async function handleFormSubmit(e){
	e.preventDefault();

	const authorName = document.getElementById('authorName').value.trim();
	const listTitle = document.getElementById('listTitle').value.trim();
	const listGenre = document.getElementById('listGenre') ? document.getElementById('listGenre').value.trim() : '';
	const listDescription = document.getElementById('listDescription').value.trim();

	if(!authorName || !listTitle){
		alert('작성자이름과 제목은 필수입니다.');
		return;
	}

	const items = [];
	for(let i = 1; i <= 5; i++){
		const titleInput = document.querySelector(`.item-title[data-index="${i}"]`);
		const ageInput = document.querySelector(`.item-age[data-index="${i}"]`);
		if(titleInput && titleInput.value.trim()){
			items.push({
				title: titleInput.value.trim(),
				ageRating: ageInput ? ageInput.value : '전체이용가'
			});
		}
	}

	if(items.length === 0){
		alert('최소 1개 이상의 항목을 입력하세요.');
		return;
	}

	const newItem = {
		id: Math.max(0, ...lists.map(l => l.id || 0)) + 1,
		author: authorName,
		title: listTitle,
		genre: listGenre,
		description: listDescription,
		items: items,
		comment: listDescription
	};

	// 먼저 n8n으로 전송을 시도합니다. 실패하면 항목을 생성하지 않고 폼을 유지합니다.
	const sent = await sendToN8n(newItem);
	if(!sent){
		alert('n8n 전송에 실패했습니다. 항목은 생성되지 않았습니다. 콘솔을 확인하세요.');
		return;
	}

	// 전송 성공 시에만 목록에 추가하고 저장합니다.
	lists.unshift(newItem);
	await saveData();
	closeAddModal();
	renderLists(lists);
	alert('성공적으로 추가되고 n8n으로 전송되었습니다!');
}

async function saveData(){
	try{
		localStorage.setItem('top5_lists', JSON.stringify(lists));
		console.log('localStorage에 저장됨');
	}catch(e){
		console.warn('localStorage 저장 오류:', e);
	}

	try{
		const response = await fetch(LOCAL_DATA_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(lists)
		});
		if(!response.ok) console.warn('로컬 데이터 저장 실패');
	}catch(e){
		console.warn('로컬 데이터 저장 오류:', e);
	}
}

function init(){
	// DOM 요소 초기화
	$lists = document.getElementById('lists');
	$search = document.getElementById('search');
	$addBtn = document.getElementById('addBtn');
	$addModal = document.getElementById('addModal');
	$addModalClose = document.getElementById('addModalClose');
	$addForm = document.getElementById('addForm');
	$addFormCancel = document.getElementById('addFormCancel');
	$itemsContainer = document.getElementById('itemsContainer');
	$detailModal = document.getElementById('detailModal');
	$detailModalClose = document.getElementById('detailModalClose');
	$detailModalOverlay = document.getElementById('detailModalOverlay');
	$detailContent = document.getElementById('detailContent');

	// 이벤트 리스너 추가
	$search.addEventListener('input', onSearch);
	$addBtn.addEventListener('click', openAddModal);
	$addModalClose.addEventListener('click', closeAddModal);
	$addFormCancel.addEventListener('click', closeAddModal);
	$addForm.addEventListener('submit', handleFormSubmit);
	$detailModalClose.addEventListener('click', closeDetailModal);
	$detailModalOverlay.addEventListener('click', closeDetailModal);

	document.addEventListener('keydown', (e) => {
		if(e.key === 'Escape'){
			if($addModal.style.display === 'flex') closeAddModal();
			if($detailModal.style.display === 'flex') closeDetailModal();
		}
	});

	loadData();
}

document.addEventListener('DOMContentLoaded', init);
