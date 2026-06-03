const STORAGE_KEYS = {
  user: "campus-market-user",
  token: "campus-market-token",
  posts: "campus-market-posts",
  rooms: "campus-market-local-rooms",
  apiBase: "campus-market-api-base",
  chatApiBase: "campus-market-chat-api-base",
};

const defaultPosts = [
  {
    id: 1,
    seller_id: 1,
    title: "운영체제 전공책 판매",
    content: "필기 조금 있고 상태 좋습니다. 공학관 앞에서 거래 가능해요.",
    price: 18000,
    status: "available",
    created_at: "2026-05-25T09:00:00",
  },
  {
    id: 2,
    seller_id: 2,
    title: "무선 키보드",
    content: "프로젝트 기간에만 사용했습니다. 배터리 포함입니다.",
    price: 25000,
    status: "available",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 3,
    seller_id: 3,
    title: "기숙사용 미니 선풍기",
    content: "소음 적고 책상 위에 두기 좋습니다.",
    price: 12000,
    status: "sold",
    created_at: "2026-05-25T10:00:00",
  },
];

const state = {
  user: loadJson(STORAGE_KEYS.user, null),
  token: localStorage.getItem(STORAGE_KEYS.token) || "",
  posts: loadJson(STORAGE_KEYS.posts, defaultPosts),
  localRooms: loadJson(STORAGE_KEYS.rooms, []),
  activeRoom: null,
  socket: null,
  wallet: null,
  transactions: [],
  lastPurchase: null,
  selectedPost: null,
};

const elements = {
  authView: document.querySelector("#authView"),
  appShell: document.querySelector("#appShell"),
  navTabs: document.querySelectorAll(".nav-tab"),
  views: document.querySelectorAll(".view"),
  loginForm: document.querySelector("#loginForm"),
  signupButton: document.querySelector("#signupButton"),
  logoutButton: document.querySelector("#logoutButton"),
  nicknameInput: document.querySelector("#nicknameInput"),
  passwordInput: document.querySelector("#passwordInput"),
  currentNickname: document.querySelector("#currentNickname"),
  currentUserId: document.querySelector("#currentUserId"),
  currentWallet: document.querySelector("#currentWallet"),
  apiBaseInput: document.querySelector("#apiBaseInput"),
  postForm: document.querySelector("#postForm"),
  postTitleInput: document.querySelector("#postTitleInput"),
  postContentInput: document.querySelector("#postContentInput"),
  postPriceInput: document.querySelector("#postPriceInput"),
  postList: document.querySelector("#postList"),
  postCardTemplate: document.querySelector("#postCardTemplate"),
  detailTitle: document.querySelector("#detailTitle"),
  detailPostId: document.querySelector("#detailPostId"),
  detailName: document.querySelector("#detailName"),
  detailContent: document.querySelector("#detailContent"),
  detailPrice: document.querySelector("#detailPrice"),
  detailMeta: document.querySelector("#detailMeta"),
  detailStatus: document.querySelector("#detailStatus"),
  detailChatButton: document.querySelector("#detailChatButton"),
  detailBuyButton: document.querySelector("#detailBuyButton"),
  backToMarketButton: document.querySelector("#backToMarketButton"),
  chatApiInput: document.querySelector("#chatApiInput"),
  roomForm: document.querySelector("#roomForm"),
  roomPostIdInput: document.querySelector("#roomPostIdInput"),
  roomBuyerIdInput: document.querySelector("#roomBuyerIdInput"),
  loadRoomsButton: document.querySelector("#loadRoomsButton"),
  roomList: document.querySelector("#roomList"),
  activeRoomTitle: document.querySelector("#activeRoomTitle"),
  connectionStatus: document.querySelector("#connectionStatus"),
  messageList: document.querySelector("#messageList"),
  messageForm: document.querySelector("#messageForm"),
  messageInput: document.querySelector("#messageInput"),
  sendButton: document.querySelector("#sendButton"),
  refreshPaymentButton: document.querySelector("#refreshPaymentButton"),
  walletBalance: document.querySelector("#walletBalance"),
  walletUserId: document.querySelector("#walletUserId"),
  transactionList: document.querySelector("#transactionList"),
  refreshMyPageButton: document.querySelector("#refreshMyPageButton"),
  purchaseSummary: document.querySelector("#purchaseSummary"),
  purchaseList: document.querySelector("#purchaseList"),
};

init();

function init() {
  elements.apiBaseInput.value = localStorage.getItem(STORAGE_KEYS.apiBase) || elements.apiBaseInput.value;
  elements.chatApiInput.value = localStorage.getItem(STORAGE_KEYS.chatApiBase) || elements.chatApiInput.value;

  bindEvents();
  renderAuthState();
  renderUser();
  renderPosts();
  renderRooms(state.localRooms);
  loadPosts();

  if (state.token) {
    loadCurrentUser();
    loadPaymentSummary();
  }
}

function bindEvents() {
  elements.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  elements.apiBaseInput.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.apiBase, getApiBase());
    loadPosts();
  });

  elements.chatApiInput.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.chatApiBase, getChatApiBase());
  });

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await login();
  });

  elements.signupButton.addEventListener("click", signup);
  elements.logoutButton.addEventListener("click", logout);

  elements.postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createPost();
  });

  elements.roomForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createRoomFromForm();
  });

  elements.loadRoomsButton.addEventListener("click", loadRooms);
  elements.refreshPaymentButton.addEventListener("click", loadPaymentSummary);
  elements.refreshMyPageButton.addEventListener("click", refreshAccountViews);
  elements.backToMarketButton.addEventListener("click", () => switchView("marketView"));
  elements.detailChatButton.addEventListener("click", () => {
    if (!state.selectedPost) return;
    openChatForPost(state.selectedPost);
  });
  elements.detailBuyButton.addEventListener("click", () => {
    if (!state.selectedPost) return;
    purchasePost(state.selectedPost, elements.detailBuyButton);
  });

  elements.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });
}

function switchView(viewId) {
  elements.navTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === viewId);
  });
  elements.views.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });

  if (viewId === "chatView") {
    loadRooms();
  }

  if (viewId === "paymentView") {
    loadPaymentSummary();
  }

  if (viewId === "myPageView") {
    refreshAccountViews();
  }
}

function renderAuthState() {
  const isAuthenticated = Boolean(state.token && state.user);
  elements.authView.classList.toggle("is-hidden", isAuthenticated);
  elements.appShell.classList.toggle("is-hidden", !isAuthenticated);
}

async function signup() {
  const credentials = getCredentials();
  if (!credentials) return;

  try {
    const user = await apiRequest("/auth/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    state.user = user;
    saveJson(STORAGE_KEYS.user, user);
    renderUser();
    setNotice("회원가입이 완료되었습니다. 같은 정보로 로그인해주세요.");
  } catch (error) {
    setNotice(`회원가입 실패: ${error.message}`);
  }
}

async function login() {
  const credentials = getCredentials();
  if (!credentials) return;

  const body = new URLSearchParams();
  body.set("username", credentials.nickname);
  body.set("password", credentials.password);

  try {
    const token = await apiRequest("/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    state.token = token.access_token;
    localStorage.setItem(STORAGE_KEYS.token, state.token);
    await loadCurrentUser();
    await loadPaymentSummary();
    renderAuthState();
    switchView("marketView");
    setNotice("로그인되었습니다. 게시글 작성과 채팅을 사용할 수 있습니다.");
  } catch (error) {
    setNotice(`로그인 실패: ${error.message}`);
  }
}

async function loadCurrentUser() {
  try {
    const user = await apiRequest("/auth/users/me/", {
      headers: authHeaders(),
    });

    state.user = user;
    saveJson(STORAGE_KEYS.user, user);
    renderUser();
    renderPosts();
    renderAuthState();
  } catch (error) {
    state.token = "";
    localStorage.removeItem(STORAGE_KEYS.token);
    state.wallet = null;
    state.transactions = [];
    state.lastPurchase = null;
    renderUser();
    renderPayment();
    renderMyPage();
    renderAuthState();
  }
}

function logout() {
  closeSocket();
  state.user = null;
  state.token = "";
  state.wallet = null;
  state.transactions = [];
  state.localRooms = [];
  state.activeRoom = null;
  state.selectedPost = null;
  state.lastPurchase = null;
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.rooms);
  elements.passwordInput.value = "";
  renderUser();
  renderPayment();
  renderMyPage();
  renderRooms([]);
  renderAuthState();
}

function getCredentials() {
  const nickname = elements.nicknameInput.value.trim();
  const password = elements.passwordInput.value;

  if (!nickname || !password) {
    setNotice("닉네임과 비밀번호를 입력해주세요.");
    return null;
  }

  return { nickname, password };
}

function renderUser() {
  elements.nicknameInput.value = state.user?.nickname || elements.nicknameInput.value || "";
  elements.currentNickname.textContent = state.user?.nickname || "로그인 필요";
  elements.currentUserId.textContent = state.user?.id ? `user_id ${state.user.id}` : "user_id 없음";
  elements.currentWallet.textContent = state.wallet ? `잔액 ${formatMoney(state.wallet.money)}` : "잔액 조회 전";
  elements.roomBuyerIdInput.value = state.user?.id || "";
}

async function loadPosts() {
  try {
    const posts = await apiRequest("/posts");
    state.posts = Array.isArray(posts) ? posts : [];
    saveJson(STORAGE_KEYS.posts, state.posts);
    renderPosts();
  } catch (error) {
    renderPosts();
    setNotice("게시글 API 연결 전까지 저장된 더미 데이터를 표시합니다.");
  }
}

function renderPosts() {
  elements.postList.innerHTML = "";

  if (!state.posts.length) {
    const empty = document.createElement("p");
    empty.className = "eyebrow";
    empty.textContent = "등록된 게시글이 없습니다.";
    elements.postList.append(empty);
    return;
  }

  state.posts.forEach((post) => {
    const card = elements.postCardTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector(".post-id").textContent = `POST #${post.id}`;
    card.querySelector("h3").textContent = post.title;
    card.querySelector("p").textContent = post.content || "내용 없음";
    card.querySelector(".post-price").textContent = formatMoney(post.price || 0);
    card.querySelector(".post-meta").textContent = `seller_id ${post.seller_id} · ${formatDate(post.created_at)}`;
    card.querySelector(".post-status").textContent = getPostStatusLabel(post.status);
    card.querySelector(".post-status").classList.toggle("is-sold", post.status === "sold");
    card.querySelector(".open-chat-button").addEventListener("click", () => {
      openChatForPost(post);
    });
    card.querySelector(".detail-button").addEventListener("click", () => openPostDetail(post));
    const buyButton = card.querySelector(".buy-button");
    buyButton.disabled = !state.token || post.status === "sold" || Number(post.seller_id) === Number(state.user?.id);
    buyButton.addEventListener("click", () => purchasePost(post, buyButton));
    elements.postList.append(card);
  });
}

function openPostDetail(post) {
  state.selectedPost = post;
  renderPostDetail(post);
  switchView("itemDetailView");
}

function renderPostDetail(post) {
  elements.detailTitle.textContent = post.title;
  elements.detailPostId.textContent = `POST #${post.id}`;
  elements.detailName.textContent = post.title;
  elements.detailContent.textContent = post.content || "내용 없음";
  elements.detailPrice.textContent = formatMoney(post.price || 0);
  elements.detailMeta.textContent = `seller_id ${post.seller_id} · ${formatDate(post.created_at)}`;
  elements.detailStatus.textContent = getPostStatusLabel(post.status);
  elements.detailStatus.classList.toggle("is-sold", post.status === "sold");
  elements.detailBuyButton.disabled = !state.token || post.status === "sold" || Number(post.seller_id) === Number(state.user?.id);
}

function openChatForPost(post) {
  switchView("chatView");
  elements.roomPostIdInput.value = post.id;
  elements.roomBuyerIdInput.value = state.user?.id || "";
}

async function createPost() {
  if (!state.token) {
    setNotice("게시글을 작성하려면 먼저 로그인해주세요.");
    return;
  }

  const payload = {
    title: elements.postTitleInput.value.trim(),
    content: elements.postContentInput.value.trim(),
    price: Number(elements.postPriceInput.value),
  };

  if (!payload.price || payload.price < 1) {
    setNotice("가격은 1원 이상으로 입력해주세요.");
    return;
  }

  try {
    await apiRequest("/posts", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    elements.postForm.reset();
    setNotice("게시글이 등록되었습니다.");
    await loadPosts();
    await loadPaymentSummary();
  } catch (error) {
    setNotice(`게시글 등록 실패: ${error.message}`);
  }
}

async function loadPaymentSummary() {
  if (!state.token) {
    state.wallet = null;
    state.transactions = [];
    renderUser();
    renderPayment();
    return;
  }

  try {
    const [wallet, transactions] = await Promise.all([
      apiRequest("/payment/wallet", { headers: authHeaders() }),
      apiRequest("/payment/transactions", { headers: authHeaders() }),
    ]);
    state.wallet = wallet;
    state.transactions = Array.isArray(transactions) ? transactions : [];
    renderUser();
    renderPayment();
    renderMyPage();
  } catch (error) {
    setNotice(`결제 정보 조회 실패: ${error.message}`);
    renderPayment();
    renderMyPage();
  }
}

function renderPayment() {
  elements.walletBalance.textContent = state.wallet ? formatMoney(state.wallet.money) : "로그인 후 조회 가능";
  elements.walletUserId.textContent = state.wallet ? `wallet #${state.wallet.id} · user_id ${state.wallet.user_id}` : "user_id 없음";
  elements.transactionList.innerHTML = "";

  if (!state.transactions.length) {
    const empty = document.createElement("p");
    empty.className = "eyebrow";
    empty.textContent = "거래 내역이 없습니다.";
    elements.transactionList.append(empty);
    return;
  }

  state.transactions.forEach((transaction) => {
    const item = document.createElement("article");
    const isBuyer = Number(transaction.buyer_id) === Number(state.user?.id);
    item.className = "transaction-item";
    item.innerHTML = `
      <strong>${isBuyer ? "구매" : "판매"} · ${formatMoney(transaction.amount)}</strong>
      <span>post ${transaction.post_id} · buyer ${transaction.buyer_id} · seller ${transaction.seller_id}</span>
      <time>${formatDate(transaction.created_at)}</time>
    `;
    elements.transactionList.append(item);
  });
}

function renderMyPage() {
  const purchases = state.transactions.filter((transaction) => Number(transaction.buyer_id) === Number(state.user?.id));
  elements.purchaseList.innerHTML = "";

  if (state.lastPurchase) {
    const post = findPost(state.lastPurchase.post_id);
    elements.purchaseSummary.innerHTML = `
      <p class="eyebrow">최근 구매 완료</p>
      <strong>${escapeHtml(post?.title || `POST #${state.lastPurchase.post_id}`)}</strong>
      <span>${formatMoney(state.lastPurchase.amount)} 결제 · 현재 잔액 ${state.wallet ? formatMoney(state.wallet.money) : "조회 전"}</span>
    `;
  } else {
    elements.purchaseSummary.innerHTML = `
      <p class="eyebrow">최근 구매</p>
      <strong>아직 구매 내역이 없습니다.</strong>
      <span>구매가 완료되면 이곳에 표시됩니다.</span>
    `;
  }

  if (!purchases.length) {
    const empty = document.createElement("p");
    empty.className = "eyebrow";
    empty.textContent = "구매한 물건이 없습니다.";
    elements.purchaseList.append(empty);
    return;
  }

  purchases.forEach((transaction) => {
    const post = findPost(transaction.post_id);
    const item = document.createElement("article");
    item.className = "purchase-item";
    item.innerHTML = `
      <strong>${escapeHtml(post?.title || `POST #${transaction.post_id}`)}</strong>
      <span>${escapeHtml(post?.content || "상품 정보 없음")}</span>
      <div>${formatMoney(transaction.amount)} · seller ${transaction.seller_id} · ${formatDate(transaction.created_at)}</div>
    `;
    elements.purchaseList.append(item);
  });
}

async function refreshAccountViews() {
  await Promise.all([loadPosts(), loadPaymentSummary()]);
}

async function purchasePost(post, button) {
  if (!state.token) {
    setNotice("구매하려면 먼저 로그인해주세요.");
    return;
  }

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "구매 처리 중";

  try {
    await ensureChatRoomForPurchase(post);
    const transaction = await apiRequest("/payment/transactions", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id: post.id }),
    });

    state.lastPurchase = transaction;
    await Promise.all([loadPosts(), loadPaymentSummary(), loadRooms()]);
    const refreshedPost = findPost(post.id);
    if (refreshedPost && state.selectedPost?.id === refreshedPost.id) {
      state.selectedPost = refreshedPost;
      renderPostDetail(refreshedPost);
    }
    renderMyPage();
    switchView("myPageView");
    setNotice(`구매 완료: ${formatMoney(transaction.amount)}가 가상머니에서 차감되었습니다. 마이페이지에서 구매한 물건을 확인하세요.`);
  } catch (error) {
    setNotice(`구매 실패: ${error.message}`);
  } finally {
    button.textContent = originalText;
    renderPosts();
  }
}

async function ensureChatRoomForPurchase(post) {
  const existingRoom = state.localRooms.find((room) => {
    return Number(room.posts_id) === Number(post.id) && Number(room.buyer_id) === Number(state.user?.id) && !room.localOnly;
  });

  if (existingRoom) {
    return existingRoom;
  }

  const response = await chatRequest("/api/chat/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ posts_id: post.id, buyer_id: state.user.id }),
  });

  if (!response.success) {
    throw new Error(response.message || "채팅방 생성 실패");
  }

  upsertLocalRoom(response.data);
  renderRooms(state.localRooms);
  return response.data;
}

async function createRoomFromForm() {
  const postsId = Number(elements.roomPostIdInput.value);
  const buyerId = Number(elements.roomBuyerIdInput.value || state.user?.id);

  if (!buyerId) {
    setConnectionStatus("로그인이 필요합니다", "error");
    return;
  }

  try {
    const response = await chatRequest("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts_id: postsId, buyer_id: buyerId }),
    });

    if (!response.success) {
      throw new Error(response.message || "채팅방 생성 실패");
    }

    upsertLocalRoom(response.data);
    renderRooms(state.localRooms);
    openRoom(response.data);
  } catch (error) {
    const fallbackRoom = {
      room_id: Date.now(),
      posts_id: postsId,
      buyer_id: buyerId,
      seller_id: findSellerId(postsId),
      localOnly: true,
    };
    upsertLocalRoom(fallbackRoom);
    renderRooms(state.localRooms);
    openRoom(fallbackRoom);
    setConnectionStatus("채팅 API 연결 실패: 로컬 방 생성", "error");
  }
}

async function loadRooms() {
  if (!state.user?.id) {
    renderRooms(state.localRooms);
    return;
  }

  try {
    const response = await chatRequest(`/api/chat/rooms/${state.user.id}`);
    const rooms = Array.isArray(response.data) ? response.data : [];
    state.localRooms = mergeRooms(state.localRooms, rooms);
    saveJson(STORAGE_KEYS.rooms, state.localRooms);
    renderRooms(state.localRooms);
  } catch (error) {
    renderRooms(state.localRooms);
    setConnectionStatus("채팅방 목록 API 대기 중", "error");
  }
}

function renderRooms(rooms) {
  elements.roomList.innerHTML = "";

  if (!rooms.length) {
    const empty = document.createElement("p");
    empty.className = "eyebrow";
    empty.textContent = "아직 채팅방이 없습니다.";
    elements.roomList.append(empty);
    return;
  }

  rooms.forEach((room) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-item";
    button.classList.toggle("is-active", state.activeRoom?.room_id === room.room_id);
    button.innerHTML = `
      채팅방 #${room.room_id}
      <small>post ${room.posts_id} · buyer ${room.buyer_id} · seller ${room.seller_id ?? "-"}</small>
    `;
    button.addEventListener("click", () => openRoom(room));
    elements.roomList.append(button);
  });
}

function openRoom(room) {
  closeSocket();
  state.activeRoom = room;
  elements.activeRoomTitle.textContent = `채팅방 #${room.room_id}`;
  elements.messageList.innerHTML = "";
  elements.messageInput.disabled = false;
  elements.sendButton.disabled = false;
  renderRooms(state.localRooms);

  if (room.localOnly) {
    setConnectionStatus("로컬 미리보기", "error");
    appendMessage({
      sender_id: 0,
      content: "채팅 API 연결이 되지 않아 로컬 채팅방으로 열었습니다.",
      created_at: new Date().toISOString(),
    });
    return;
  }

  connectSocket(room);
}

function connectSocket(room) {
  const wsBase = getChatApiBase().replace(/^http/, "ws");
  const socketUrl = `${wsBase}/api/chat/ws/${room.room_id}/${state.user.id}`;
  const socket = new WebSocket(socketUrl);
  state.socket = socket;
  setConnectionStatus("연결 중", "");

  socket.addEventListener("open", () => {
    setConnectionStatus("실시간 연결됨", "online");
  });

  socket.addEventListener("message", (event) => {
    try {
      appendMessage(JSON.parse(event.data));
    } catch {
      appendMessage({
        sender_id: 0,
        content: event.data,
        created_at: new Date().toISOString(),
      });
    }
  });

  socket.addEventListener("close", () => {
    setConnectionStatus("연결 종료", "error");
  });

  socket.addEventListener("error", () => {
    setConnectionStatus("WebSocket 오류", "error");
  });
}

function sendMessage() {
  const content = elements.messageInput.value.trim();
  if (!content || !state.activeRoom) return;

  if (state.socket?.readyState === WebSocket.OPEN) {
    state.socket.send(content);
  } else {
    appendMessage({
      sender_id: state.user?.id || 0,
      content,
      created_at: new Date().toISOString(),
    });
  }

  elements.messageInput.value = "";
}

function appendMessage(message) {
  const bubble = document.createElement("div");
  const isMine = Number(message.sender_id) === Number(state.user?.id);
  bubble.className = `message${isMine ? " mine" : ""}`;

  const sender = isMine ? `${state.user.nickname} · 나` : `user_id ${message.sender_id}`;
  bubble.innerHTML = `
    <strong>${escapeHtml(sender)}</strong>
    <span>${escapeHtml(message.content)}</span>
    <time>${formatDate(message.created_at)}</time>
  `;

  elements.messageList.append(bubble);
  elements.messageList.scrollTop = elements.messageList.scrollHeight;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${getApiBase()}${path}`, options);
  return parseResponse(response);
}

async function chatRequest(path, options = {}) {
  const response = await fetch(`${getChatApiBase()}${path}`, options);
  return parseResponse(response);
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data.detail?.error?.message || data.detail?.message || data.detail || data.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function closeSocket() {
  if (state.socket) {
    state.socket.close();
    state.socket = null;
  }
}

function setConnectionStatus(text, type) {
  elements.connectionStatus.textContent = text;
  elements.connectionStatus.classList.toggle("is-online", type === "online");
  elements.connectionStatus.classList.toggle("is-error", type === "error");
}

function setNotice(message) {
  document.querySelector("#notice").textContent = message;
}

function getApiBase() {
  return elements.apiBaseInput.value.trim().replace(/\/$/, "");
}

function getChatApiBase() {
  return elements.chatApiInput.value.trim().replace(/\/$/, "");
}

function findSellerId(postsId) {
  return findPost(postsId)?.seller_id ?? null;
}

function findPost(postsId) {
  return state.posts.find((post) => Number(post.id) === Number(postsId)) ?? null;
}

function upsertLocalRoom(room) {
  const normalized = {
    room_id: room.room_id ?? room.id,
    posts_id: room.posts_id,
    buyer_id: room.buyer_id,
    seller_id: room.seller_id,
    localOnly: Boolean(room.localOnly),
  };

  state.localRooms = mergeRooms(state.localRooms, [normalized]);
  saveJson(STORAGE_KEYS.rooms, state.localRooms);
}

function mergeRooms(currentRooms, incomingRooms) {
  const roomMap = new Map();
  [...currentRooms, ...incomingRooms].forEach((room) => {
    const key = String(room.room_id ?? room.id);
    roomMap.set(key, { ...roomMap.get(key), ...room, room_id: Number(key) });
  });
  return [...roomMap.values()].sort((a, b) => b.room_id - a.room_id);
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getPostStatusLabel(status) {
  return status === "sold" ? "판매 완료" : "판매 중";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
