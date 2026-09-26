const grid = document.getElementById("opportunityGrid");
const resultsCount = document.getElementById("resultsCount");
const sortOptions = document.getElementById("sortOptions");
const filterButtons = document.querySelectorAll(".filter-btn");

const profile = JSON.parse(
    localStorage.getItem("studentProfile")
);

if (!profile) {
    window.location.href = "selection.html";
}


// -----------------------------
// MATCHING SYSTEM
// -----------------------------

function calculateMatch(opportunity) {

 let score = 0;

 const title = (opportunity.title || "").toLowerCase();
 const type = (opportunity.type || "").toLowerCase();
const eligibility = Array.isArray(opportunity.eligibility)
 ? opportunity.eligibility.join(" ").toLowerCase()
    : String(opportunity.eligibility || "").toLowerCase();

    const mode = (opportunity.mode || "").toLowerCase();
    const fee = (opportunity.fee || "").toLowerCase();

    // 1. Eligibility — 30 points
    if (
        eligibility.includes("student") ||
        eligibility.includes("school")
    ) {
        score += 30;
    }

    // 2. Interest — 30 points
    const interestKeywords = {
        mathematics: ["math", "mathematics", "quant"],
        science: ["science", "physics", "chemistry", "biology"],
        ai: ["ai", "artificial intelligence", "machine learning"],
        coding: ["coding", "programming", "software", "developer"],
        business: ["business", "entrepreneur", "startup", "enterprise"],
        finance: ["finance", "financial", "stock", "investment"],
        environment: ["environment", "climate", "sustainability", "green"],
        design: ["design", "ui", "ux", "creative"],
        writing: ["writing", "essay", "literature"],
        "social-impact": ["social", "community", "impact", "sdg"]
    };

    const combinedText = `${title} ${type} ${eligibility}`;

    let interestMatched = false;

    profile.interests.forEach(interest => {

        const keywords = interestKeywords[interest] || [];

        if (
            keywords.some(keyword =>
                combinedText.includes(keyword)
            )
        ) {
            interestMatched = true;
        }
    });

    if (interestMatched) {
        score += 30;
    }

    // 3. Opportunity type — 20 points
    const typeMatches = profile.opportunityTypes.some(
        selectedType => type.includes(selectedType)
    );

    if (typeMatches) {
        score += 20;
    }

    // 4. Mode — 10 points
    if (
        profile.mode === "both" ||
        mode.includes(profile.mode)
    ) {
        score += 10;
    }

    // 5. Cost — 10 points
    if (
        profile.cost === "both" ||
        (profile.cost === "free" && fee.includes("free"))
    ) {
        score += 10;
    }

    return score;
}
// filters
let allOpportunities = [];
let currentFilter = "all";

// -----------------------------
// LOAD OPPORTUNITIES
// -----------------------------

async function loadOpportunities() {

    try {

        const response = await fetch(
            "/api/opportunities"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch opportunities");
        }

        const data = await response.json();

        console.log("Brabble data:", data);

       allOpportunities = data.listings || [];

let opportunities = [...allOpportunities];

        // Calculate score for every opportunity
        opportunities = opportunities.map(opportunity => ({
            ...opportunity,
            matchScore: calculateMatch(opportunity)
        }));

        // Highest match first
        opportunities.sort(
            (a, b) => b.matchScore - a.matchScore
        );

        resultsCount.textContent =
            `${opportunities.length} opportunities found`;


            
        displayOpportunities(opportunities);

        // Sorting
        sortOptions.addEventListener("change", () => {

            if (sortOptions.value === "match") {

                opportunities.sort(
                    (a, b) => b.matchScore - a.matchScore
                );

            } else if (sortOptions.value === "deadline") {

                opportunities.sort((a, b) => {

                    const dateA = new Date(a.deadline);
                    const dateB = new Date(b.deadline);

                    return dateA - dateB;
                });
            }

            displayOpportunities(opportunities);
        });

    } catch (error) {

        console.error(error);

        grid.innerHTML = `
            <div class="error-message">
                <h2>Something went wrong 😕</h2>
                <p>We couldn't load opportunities right now.</p>
            </div>
        `;
    }
}
// filters
function applyFilter(filter) {

    currentFilter = filter;

    let filtered = [...allOpportunities];

    // Calculate scores again
    filtered = filtered.map(opportunity => ({
        ...opportunity,
        matchScore: calculateMatch(opportunity)
    }));

    if (filter === "match") {

        filtered.sort(
            (a, b) => b.matchScore - a.matchScore
        );

    }

    else if (filter === "hackathon") {

        filtered = filtered.filter(opportunity =>
            (opportunity.type || "")
                .toLowerCase()
                .includes("hackathon")
        );

    }

    else if (filter === "competition") {

        filtered = filtered.filter(opportunity =>
            (opportunity.type || "")
                .toLowerCase()
                .includes("competition")
        );

    }

    else if (filter === "olympiad") {

        filtered = filtered.filter(opportunity =>
            (opportunity.title || "")
                .toLowerCase()
                .includes("olympiad")
        );

    }

    else if (filter === "online") {

        filtered = filtered.filter(opportunity =>
            (opportunity.mode || "")
                .toLowerCase()
                .includes("online")
        );

    }

    else if (filter === "offline") {

        filtered = filtered.filter(opportunity =>
            (opportunity.mode || "")
                .toLowerCase()
                .includes("offline")
        );

    }
    

    else if (filter === "free") {

        filtered = filtered.filter(opportunity =>
            (opportunity.fee || "")
                .toLowerCase()
                .includes("free")
        );

    }
else if (filter === "closing") {

    filtered = filtered.filter(opportunity => {

        if (!opportunity.deadline) {
            return false;
        }

        const deadlineDate = new Date(opportunity.deadline);

        if (isNaN(deadlineDate)) {
            return false;
        }

        const now = new Date();

        const difference =
            deadlineDate.getTime() - now.getTime();

        const daysLeft = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

        return daysLeft >= 0 && daysLeft <= 7;
    });

} 

    resultsCount.textContent =
        `${filtered.length} opportunities found`;

    displayOpportunities(filtered);
}

// -----------------------------
// DISPLAY CARDS
// -----------------------------

function displayOpportunities(opportunities) {

    grid.innerHTML = "";

    opportunities.forEach(opportunity => {

        const card = document.createElement("article");

        card.className = "opportunity-card";

        const eligibility = Array.isArray(opportunity.eligibility)
            ? opportunity.eligibility.join(" • ")
            : opportunity.eligibility || "Check official page";

        const team = opportunity.team || "Not specified";

        const fee = opportunity.fee || "Check official page";

        let prize = "Not specified";

if (typeof opportunity.prize === "string") {
    prize = opportunity.prize;
} 
else if (
    opportunity.prize &&
    typeof opportunity.prize === "object"
) {
    if (opportunity.prize.amount) {
        prize = `₹${Number(opportunity.prize.amount).toLocaleString("en-IN")}`;
    } 
    else if (opportunity.prize.inr) {
        prize = `₹${Number(opportunity.prize.inr).toLocaleString("en-IN")}`;
    } 
    else if (opportunity.prize.value) {
        prize = String(opportunity.prize.value);
    }
} 
else if (opportunity.inr) {
    prize = `₹${Number(opportunity.inr).toLocaleString("en-IN")}`;
}

        const mode = (opportunity.mode || "ONLINE").toUpperCase();

        const type = (opportunity.type || "OPPORTUNITY").toUpperCase();

     const deadlineDate = opportunity.deadline
    ? new Date(opportunity.deadline)
    : null;

let deadline = "Check official page";
let daysLeft = null;
let expired = false;

if (deadlineDate && !isNaN(deadlineDate)) {

    deadline = deadlineDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

    const now = new Date();

    const difference =
        deadlineDate.getTime() - now.getTime();

    daysLeft = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
        expired = true;
    }
}

        const location =
            opportunity.city && mode === "OFFLINE"
                ? `📍 ${opportunity.city}`
                : "";

        card.innerHTML = `

            <div class="card-top">

                <span class="opportunity-type">
                    ${type}
                </span>

                <span class="mode-badge">
                    ${mode === "ONLINE" ? "🌐" : "📍"} ${mode}
                </span>

            </div>


            <h3 class="opportunity-title">
                ${opportunity.title || "Untitled Opportunity"}
            </h3>


            <p class="organizer">
                🏢 ${opportunity.platform || "Organizer not specified"}
            </p>


            <div class="opportunity-details">

                <div class="detail">
                    <span class="detail-icon">👤</span>
                    <div>
                        <strong>Eligibility</strong>
                        <span>${eligibility}</span>
                    </div>
                </div>


                <div class="detail">
                    <span class="detail-icon">👥</span>
                    <div>
                        <strong>Team</strong>
                        <span>${team}</span>
                    </div>
                </div>


                <div class="detail">
                    <span class="detail-icon">💰</span>
                    <div>
                        <strong>Entry</strong>
                        <span>${fee}</span>
                    </div>
                </div>


                <div class="detail">
                    <span class="detail-icon">🏆</span>
                    <div>
                        <strong>Prize</strong>
                        <span>${prize}</span>
                    </div>
                </div>


                <div class="detail">
    <span class="detail-icon">📅</span>
    <div>
        <strong>Deadline</strong>
        <span>${deadline}</span>

        ${
            expired
                ? `<small class="expired-text">Expired</small>`
                : daysLeft === 0
                    ? `<small class="urgent-text">Ends today</small>`
                    : daysLeft === 1
                        ? `<small class="urgent-text">1 day left</small>`
                        : daysLeft > 1
                            ? `<small class="days-left">${daysLeft} days left</small>`
                            : ""
        }
    </div>
</div>

            </div>


            ${location ? `
                <div class="location">
                    ${location}
                </div>
            ` : ""}
            <div class="card-bottom">

    <div class="match-score">
        🎯 ${opportunity.matchScore}% Match
    </div>

    <button
        class="save-btn"
        data-url="${opportunity.url || ""}"
        data-title="${(opportunity.title || "Untitled Opportunity").replace(/"/g, "&quot;")}"
    >
        ☆ Save
    </button>

   <a
    href="${opportunity.url || "#"}"
    target="_blank"
    rel="noopener noreferrer"
    class="view-btn"
    data-url="${opportunity.url || ""}"
    data-title="${(opportunity.title || "Untitled Opportunity").replace(/"/g, "&quot;")}"
>
    View Opportunity 
</a>

</div>
        `;
  grid.appendChild(card);

    });

    setupSaveButtons();
    setupHistoryLinks();
}

// =============================
// SAVED OPPORTUNITIES
// =============================

function getSavedOpportunities() {
    return JSON.parse(
        localStorage.getItem("savedOpportunities") || "[]"
    );
}

function saveOpportunity(opportunity) {

    const saved = getSavedOpportunities();

    const alreadySaved = saved.some(
        item => item.url === opportunity.url
    );

    if (!alreadySaved) {
        saved.push(opportunity);

        localStorage.setItem(
            "savedOpportunities",
            JSON.stringify(saved)
        );
    }
}

function removeSavedOpportunity(url) {

    const saved = getSavedOpportunities();

    const updated = saved.filter(
        item => item.url !== url
    );

    localStorage.setItem(
        "savedOpportunities",
        JSON.stringify(updated)
    );
}
function setupSaveButtons() {

    document.querySelectorAll(".save-btn").forEach(button => {

        const url = button.dataset.url;

        const saved = getSavedOpportunities();

        if (saved.some(item => item.url === url)) {
            button.textContent = "★ Saved";
            button.classList.add("saved");
        }

        button.addEventListener("click", () => {

            const currentSaved = getSavedOpportunities();

            const existing = currentSaved.find(
                item => item.url === url
            );

            if (existing) {

                removeSavedOpportunity(url);

                button.textContent = "☆ Save";
                button.classList.remove("saved");

            } else {

                saveOpportunity({
                    url: url,
                    title: button.dataset.title
                });

                button.textContent = "★ Saved";
                button.classList.add("saved");
            }

        });

    });
}


// =============================
// VIEW HISTORY
// =============================

function setupHistoryLinks() {

    document.querySelectorAll(".view-btn").forEach(link => {

        link.addEventListener("click", () => {

            const url = link.dataset.url;

            if (!url || url === "#") {
                return;
            }

            saveToHistory({
                url: url,
                title: link.dataset.title
            });

        });

    });
}

function saveToHistory(opportunity) {

    let history = JSON.parse(
        localStorage.getItem("opportunityHistory") || "[]"
    );

    history = history.filter(
        item => item.url !== opportunity.url
    );

    history.unshift({
        url: opportunity.url,
        title: opportunity.title,
        viewedAt: new Date().toISOString()
    });

    history = history.slice(0, 20);

    localStorage.setItem(
        "opportunityHistory",
        JSON.stringify(history)
    );
}


loadOpportunities();

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        applyFilter(button.dataset.filter);
    });

});
const logoutBtn = document.getElementById("logoutBtn");

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

if (logoutBtn) {
    localStorage.removeItem("opportunityUser");
    logoutBtn.addEventListener("click", logout);
}
