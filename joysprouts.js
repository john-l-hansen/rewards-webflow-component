<script>
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

            // Update listing page (Collection List)
            const joysproutsItems = document.querySelectorAll(".joysprouts-item");
            console.log("Found", joysproutsItems.length, "JoySprouts items in listing");
            joysproutsItems.forEach(item => {
                const itemId = item.getAttribute("data-joysprouts-id");
                if (completedJoySprouts.includes(itemId)) {
                    item.classList.add("completed");
                    const listButton = item.querySelector(".complete-button");
                    if (listButton) {
                        listButton.disabled = true;
                        listButton.textContent = "Completed";
                        listButton.classList.add("completed");
                        console.log("Listing item button updated:", itemId);
                    }
                    // Optional: Remove item instead (uncomment to enable)
                    item.remove();
                }
            });
        } catch (error) {
            console.error("Error updating JoySprouts UI:", error);
        }
    }

    // Run UI update on page load
    updateJoySproutsUI();

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

                // Refresh listing page UI
                updateJoySproutsUI();
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

                // Refresh listing page UI
                updateJoySproutsUI();
            } catch (error) {
                console.error("Error updating member data from listing:", error);
                alert("An error occurred. Please try again.");
            }
        });
    });
});
</script>