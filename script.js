// =============================
// LOAD SAVED PROFILE
// =============================

const savedProfile = JSON.parse(
    localStorage.getItem("studentProfile") || "null"
);

if (savedProfile) {

    // Class
    if (savedProfile.studentClass) {
        const classInput = document.querySelector(
            `input[name="class"][value="${savedProfile.studentClass}"]`
        );

        if (classInput) {
            classInput.checked = true;
        }
    }

    // Interests
    (savedProfile.interests || []).forEach(interest => {

        const input = document.querySelector(
            `input[name="interest"][value="${interest}"]`
        );

        if (input) {
            input.checked = true;
        }

    });

    // Opportunity types
    (savedProfile.opportunityTypes || []).forEach(type => {

        const input = document.querySelector(
            `input[name="type"][value="${type}"]`
        );

        if (input) {
            input.checked = true;
        }

    });

    // Mode
    if (savedProfile.mode) {

        const modeInput = document.querySelector(
            `input[name="mode"][value="${savedProfile.mode}"]`
        );

        if (modeInput) {
            modeInput.checked = true;
        }

    }

    // Cost
    if (savedProfile.cost) {

        const costInput = document.querySelector(
            `input[name="cost"][value="${savedProfile.cost}"]`
        );

        if (costInput) {
            costInput.checked = true;
        }

    }
}

const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const studentClass = document.querySelector(
        'input[name="class"]:checked'
    )?.value;

    const interests = [...document.querySelectorAll(
        'input[name="interest"]:checked'
    )].map(input => input.value);

    const opportunityTypes = [...document.querySelectorAll(
        'input[name="type"]:checked'
    )].map(input => input.value);

    const mode = document.querySelector(
        'input[name="mode"]:checked'
    )?.value;

    const cost = document.querySelector(
        'input[name="cost"]:checked'
    )?.value;

    const profile = {
        studentClass,
        interests,
        opportunityTypes,
        mode,
        cost
    };

    console.log("Student profile:", profile);

    localStorage.setItem(
        "studentProfile",
        JSON.stringify(profile)
    );

    window.location.href = "opportunities.html";
});