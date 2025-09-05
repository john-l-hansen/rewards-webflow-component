<script>
// Add CSS styles for JoySprouts collections
const style = document.createElement('style');
style.textContent = `
    .joysprouts-tab-nav {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .joysprouts-tab-btn {
        padding: 10px 20px;
        border: 2px solid #007bff;
        background: white;
        color: #007bff;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .joysprouts-tab-btn:hover {
        background: #f8f9fa;
    }
    
    .joysprouts-tab-btn.active {
        background: #007bff;
        color: white;
    }
    
    .joysprouts-active-collection,
    .joysprouts-completed-collection {
        min-height: 200px;
    }
    
    .joysprouts-completed-collection {
        display: none;
    }
    
    .joysprouts-item.completed {
        opacity: 0.7;
        border-left: 4px solid #28a745;
    }
    
    .joysprouts-item.completed .complete-button {
        background: #28a745 !important;
        color: white !important;
    }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", async () => {
    console.log("JoySprouts script loaded");

    // Total number of JoySprouts (replace with actual number or fetch dynamically)
    const TOTAL_JOYSPROUTS = 50; // Replace with your [#]

    // Percentage-based badge checkpoints
    const badgeCheckpoints = [
        { percent: 25, badge: "25-percent-badge" },
        { percent: 50, badge: "50-percent-badge" },
        { percent: 75, badge: "75-percent-badge" },
        { percent: 100, badge: "100-percent-badge" }
    ];

    // Function to update visual state of JoySprouts (individual page and listing page)
    async function updateJoySproutsUI() {
        try {
            console.log("Updating JoySprouts UI");
            const { data: member } = await window.$memberstackDom.getCurrentMember();
            if (!member) {
                console.log("No member logged in");
                return;
            }
            console.log("Member ID:", member.id);

            const { data: memberData } = await window.$memberstackDom.getMemberJSON();
            const completedJoySprouts = memberData?.completed_joysprouts || [];
            console.log("Completed JoySprouts:", completedJoySprouts);

            // Update individual article page button
            const button = document.getElementById("complete-joysprouts-button");
            if (button) {
                const joysproutsId = button.getAttribute("data-joysprouts-id");
                console.log("Button found, ID:", joysproutsId);
                if (completedJoySprouts.includes(joysproutsId)) {
                    button.disabled = true;
                    button.textContent = "Completed";
                    button.classList.add("completed");
                    console.log("Button updated to Completed state");
                } else {
                    console.log("JoySprouts not completed, button remains active");
                }
            } else {
                console.warn("Button with ID 'complete-joysprouts-button' not found");
            }

            // Filter collections based on completion status
            await filterJoySproutsCollections(completedJoySprouts);
        } catch (error) {
            console.error("Error updating JoySprouts UI:", error);
        }
    }

    // Function to filter JoySprouts collections based on completion status
    async function filterJoySproutsCollections(completedJoySprouts) {
        try {
            // Get all JoySprouts items from both collections
            const allJoySproutsItems = document.querySelectorAll(".joysprouts-item");
            console.log("Found", allJoySproutsItems.length, "JoySprouts items total");

            // Separate items into active and completed collections
            const activeCollection = document.querySelector(".joysprouts-active-collection");
            const completedCollection = document.querySelector(".joysprouts-completed-collection");

            if (!activeCollection || !completedCollection) {
                console.warn("Collection containers not found. Please add classes 'joysprouts-active-collection' and 'joysprouts-completed-collection' to your collection containers.");
                return;
            }

            // Clear existing content
            activeCollection.innerHTML = "";
            completedCollection.innerHTML = "";

            // Process each JoySprouts item
            allJoySproutsItems.forEach(item => {
                const itemId = item.getAttribute("data-joysprouts-id");
                const isCompleted = completedJoySprouts.includes(itemId);
                
                // Clone the item to avoid moving the original
                const clonedItem = item.cloneNode(true);
                
                if (isCompleted) {
                    // Add to completed collection
                    clonedItem.classList.add("completed");
                    const listButton = clonedItem.querySelector(".complete-button");
                    if (listButton) {
                        listButton.disabled = true;
                        listButton.textContent = "Completed";
                        listButton.classList.add("completed");
                    }
                    completedCollection.appendChild(clonedItem);
                    console.log("Added to completed collection:", itemId);
                } else {
                    // Add to active collection
                    activeCollection.appendChild(clonedItem);
                    console.log("Added to active collection:", itemId);
                }
            });

            console.log("Collections filtered successfully");
        } catch (error) {
            console.error("Error filtering collections:", error);
        }
    }

    // Function to create collection navigation tabs
    function createCollectionTabs() {
        const tabsContainer = document.querySelector(".joysprouts-tabs-container");
        if (!tabsContainer) {
            console.log("No tabs container found. Add class 'joysprouts-tabs-container' to create navigation tabs.");
            return;
        }

        // Create tab navigation
        const tabNav = document.createElement("div");
        tabNav.className = "joysprouts-tab-nav";
        tabNav.innerHTML = `
            <button class="joysprouts-tab-btn active" data-tab="active">Active JoySprouts</button>
            <button class="joysprouts-tab-btn" data-tab="completed">Completed JoySprouts</button>
        `;

        // Add click handlers for tabs
        tabNav.addEventListener("click", (e) => {
            if (e.target.classList.contains("joysprouts-tab-btn")) {
                const tabType = e.target.getAttribute("data-tab");
                switchTab(tabType);
            }
        });

        tabsContainer.appendChild(tabNav);
    }

    // Function to switch between active and completed tabs
    function switchTab(tabType) {
        const activeCollection = document.querySelector(".joysprouts-active-collection");
        const completedCollection = document.querySelector(".joysprouts-completed-collection");
        const tabButtons = document.querySelectorAll(".joysprouts-tab-btn");

        if (!activeCollection || !completedCollection) return;

        // Update tab button states
        tabButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-tab") === tabType) {
                btn.classList.add("active");
            }
        });

        // Show/hide collections
        if (tabType === "active") {
            activeCollection.style.display = "block";
            completedCollection.style.display = "none";
        } else {
            activeCollection.style.display = "none";
            completedCollection.style.display = "block";
        }
    }

    // Run UI update on page load
    updateJoySproutsUI();
    createCollectionTabs();

    // Handle button click for completing a JoySprouts
    const button = document.getElementById("complete-joysprouts-button");
    if (button) {
        console.log("Binding click event to button");
        button.addEventListener("click", async () => {
            try {
                const { data: member } = await window.$memberstackDom.getCurrentMember();
                if (!member) {
                    console.log("Click attempted, but no member logged in");
                    alert("Please log in to complete a JoySprouts.");
                    return;
                }

                const joysproutsId = button.getAttribute("data-joysprouts-id");
                console.log("Button clicked, JoySprouts ID:", joysproutsId);
                const { data: memberData } = await window.$memberstackDom.getMemberJSON();
                const userData = memberData || {
                    completed_joysprouts: [],
                    last_completion_date: null,
                    streak_count: 0,
                    badges: []
                };

                // Check daily limit
                const today = new Date().toISOString().split("T")[0];
                if (userData.last_completion_date === today) {
                    console.log("Daily limit reached, last completion:", userData.last_completion_date);
                    alert("You've already completed a JoySprouts today. Come back tomorrow!");
                    return;
                }

                // Check if JoySprouts already completed
                if (userData.completed_joysprouts.includes(joysproutsId)) {
                    console.log("JoySprouts already completed:", joysproutsId);
                    alert("You've already completed this JoySprouts.");
                    return;
                }

                // Update completed JoySprouts
                userData.completed_joysprouts.push(joysproutsId);
                console.log("Added JoySprouts to completed:", joysproutsId);

                // Calculate streak
                const lastDate = userData.last_completion_date
                    ? new Date(userData.last_completion_date)
                    : null;
                const todayDate = new Date(today);
                let newStreak = userData.streak_count;
                if (lastDate) {
                    const oneDay = 24 * 60 * 60 * 1000;
                    const diffDays = Math.round((todayDate - lastDate) / oneDay);
                    newStreak = diffDays === 1 ? newStreak + 1 : 1;
                    console.log("Streak calculated, diffDays:", diffDays, "newStreak:", newStreak);
                } else {
                    newStreak = 1;
                    console.log("First completion, streak:", newStreak);
                }

                // Calculate completion percentage
                const completionPercent = (userData.completed_joysprouts.length / TOTAL_JOYSPROUTS) * 100;
                console.log("Completion percent:", completionPercent.toFixed(0) + "%");
                const newBadges = [...userData.badges];
                badgeCheckpoints.forEach(checkpoint => {
                    if (completionPercent >= checkpoint.percent && !newBadges.includes(checkpoint.badge)) {
                        newBadges.push(checkpoint.badge);
                        console.log("Badge awarded:", checkpoint.badge);
                        alert(`Congratulations! You've earned the ${checkpoint.badge}!`);
                    }
                });

                // Update member JSON
                const updatedData = {
                    ...userData,
                    completed_joysprouts: userData.completed_joysprouts,
                    last_completion_date: today,
                    streak_count: newStreak,
                    badges: newBadges
                };
                await window.$memberstackDom.updateMemberJSON({ json: updatedData });
                console.log("Member JSON updated:", updatedData);

                // Update UI after completion
                button.disabled = true;
                button.textContent = "Completed";
                button.classList.add("completed");
                console.log("Button updated to Completed state after click");

                alert(`JoySprouts completed! Streak: ${newStreak}, Progress: ${completionPercent.toFixed(0)}%`);

                // Refresh collections and UI
                await updateJoySproutsUI();
            } catch (error) {
                console.error("Error updating member data:", error);
                alert("An error occurred. Please try again.");
            }
        });
    } else {
        console.warn("No button with ID 'complete-joysprouts-button' found on page");
    }

    // Handle button clicks in the listing page (optional)
    const listingButtons = document.querySelectorAll(".complete-button");
    console.log("Found", listingButtons.length, "listing page buttons");
    listingButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                const { data: member } = await window.$memberstackDom.getCurrentMember();
                if (!member) {
                    console.log("Listing button clicked, but no member logged in");
                    alert("Please log in to complete a JoySprouts.");
                    return;
                }

                const joysproutsId = btn.getAttribute("data-joysprouts-id");
                console.log("Listing button clicked, JoySprouts ID:", joysproutsId);
                const { data: memberData } = await window.$memberstackDom.getMemberJSON();
                const userData = memberData || {
                    completed_joysprouts: [],
                    last_completion_date: null,
                    streak_count: 0,
                    badges: []
                };

                // Check daily limit
                const today = new Date().toISOString().split("T")[0];
                if (userData.last_completion_date === today) {
                    console.log("Daily limit reached for listing button");
                    alert("You've already completed a JoySprouts today. Come back tomorrow!");
                    return;
                }

                // Check if JoySprouts already completed
                if (userData.completed_joysprouts.includes(joysproutsId)) {
                    console.log("JoySprouts already completed in listing:", joysproutsId);
                    alert("You've already completed this JoySprouts.");
                    return;
                }

                // Update completed JoySprouts
                userData.completed_joysprouts.push(joysproutsId);
                console.log("Added JoySprouts to completed from listing:", joysproutsId);

                // Calculate streak
                const lastDate = userData.last_completion_date
                    ? new Date(userData.last_completion_date)
                    : null;
                const todayDate = new Date(today);
                let newStreak = userData.streak_count;
                if (lastDate) {
                    const oneDay = 24 * 60 * 60 * 1000;
                    const diffDays = Math.round((todayDate - lastDate) / oneDay);
                    newStreak = diffDays === 1 ? newStreak + 1 : 1;
                    console.log("Streak calculated for listing, diffDays:", diffDays, "newStreak:", newStreak);
                } else {
                    newStreak = 1;
                    console.log("First completion from listing, streak:", newStreak);
                }

                // Calculate completion percentage
                const completionPercent = (userData.completed_joysprouts.length / TOTAL_JOYSPROUTS) * 100;
                console.log("Completion percent from listing:", completionPercent.toFixed(0) + "%");
                const newBadges = [...userData.badges];
                badgeCheckpoints.forEach(checkpoint => {
                    if (completionPercent >= checkpoint.percent && !newBadges.includes(checkpoint.badge)) {
                        newBadges.push(checkpoint.badge);
                        console.log("Badge awarded from listing:", checkpoint.badge);
                        alert(`Congratulations! You've earned the ${checkpoint.badge}!`);
                    }
                });

                // Update member JSON
                const updatedData = {
                    ...userData,
                    completed_joysprouts: userData.completed_joysprouts,
                    last_completion_date: today,
                    streak_count: newStreak,
                    badges: newBadges
                };
                await window.$memberstackDom.updateMemberJSON({ json: updatedData });
                console.log("Member JSON updated from listing:", updatedData);

                // Update UI after completion
                btn.disabled = true;
                btn.textContent = "Completed";
                btn.classList.add("completed");
                console.log("Listing button updated to Completed state");

                alert(`JoySprouts completed! Streak: ${newStreak}, Progress: ${completionPercent.toFixed(0)}%`);

                // Refresh collections and UI
                await updateJoySproutsUI();
            } catch (error) {
                console.error("Error updating member data from listing:", error);
                alert("An error occurred. Please try again.");
            }
        });
    });
});
</script>