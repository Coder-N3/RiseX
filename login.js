const googleLoginBtn = document.getElementById("googleLoginBtn");
const guestBtn = document.getElementById("guestBtn");


// =============================
// CHECK IF PROFILE EXISTS
// =============================

function continueToApp() {

    const profile = localStorage.getItem("studentProfile");

    if (profile) {
        window.location.href = "selection.html";
    } else {
        window.location.href = "selection.html";
    }
}


// =============================
// GOOGLE LOGIN — TEMPORARY
// =============================

googleLoginBtn.addEventListener("click", () => {

    const user = {
        loggedIn: true,
        loginMethod: "google",
        loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(
        "opportunityUser",
        JSON.stringify(user)
    );

    continueToApp();
});


// =============================
// GUEST LOGIN
// =============================

guestBtn.addEventListener("click", () => {

    const user = {
        loggedIn: true,
        loginMethod: "guest",
        loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(
        "opportunityUser",
        JSON.stringify(user)
    );

    continueToApp();
});



