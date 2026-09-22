const API_URL = "/api";

let tasks = [];

let currentView = "all";



/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showLandingPage() {

    document.getElementById("landingPage").style.display = "block";

    document.getElementById("authPage").style.display = "none";

    document.getElementById("dashboardPage").style.display = "none";

}


function showAuthPage(type = "login") {

    document.getElementById("landingPage").style.display = "none";

    document.getElementById("authPage").style.display = "flex";

    document.getElementById("dashboardPage").style.display = "none";


    if (type === "register") {

        showRegister();

    } else {

        showLogin();

    }

}


function showLogin() {

    document.getElementById("loginSection").style.display = "block";

    document.getElementById("registerSection").style.display = "none";

}


function showRegister() {

    document.getElementById("loginSection").style.display = "none";

    document.getElementById("registerSection").style.display = "block";

}



/* =========================================================
   REGISTER
========================================================= */

document.getElementById("registerForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;


        const message =
            document.getElementById("registerMessage");


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json().catch(() => ({}));


            if (response.ok) {

                message.textContent =
                    "Account created successfully.";

                message.style.color = "#16a34a";


                document
                    .getElementById("registerForm")
                    .reset();


                showToast(
                    "Account created successfully."
                );


                setTimeout(() => {

                    showLogin();

                }, 800);

            } else {

                message.textContent =
                    data.message ||
                    "Registration failed.";

                message.style.color = "#dc2626";
            }


        } catch (error) {

            message.textContent =
                "Unable to connect to server.";

            message.style.color = "#dc2626";

        }

    }
);



/* =========================================================
   LOGIN
========================================================= */

document.getElementById("loginForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const message =
            document.getElementById("loginMessage");


        message.textContent = "";


        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json().catch(() => ({}));


            if (response.ok) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "userName",
                    data.name
                );

                localStorage.setItem(
                    "userEmail",
                    data.email
                );


                showToast("Welcome back!");

                showDashboard();

            } else {

                message.textContent =
                    data.message ||
                    "Invalid email or password.";

                message.style.color = "#dc2626";

            }


        } catch (error) {

            message.textContent =
                "Unable to connect to server.";

            message.style.color = "#dc2626";

        }

    }
);



/* =========================================================
   DASHBOARD
========================================================= */

function showDashboard() {

    document.getElementById("landingPage").style.display = "none";

    document.getElementById("authPage").style.display = "none";

    document.getElementById("dashboardPage").style.display = "flex";


    const name =
        localStorage.getItem("userName") || "User";

    const email =
        localStorage.getItem("userEmail") || "";


    updateProfileUI(name, email);

    updateDate();


    loadTasks();

}



function updateProfileUI(name, email) {

    const firstLetter =
        name.charAt(0).toUpperCase() || "U";


    document.getElementById(
        "welcomeName"
    ).textContent = name;


    document.getElementById(
        "profileName"
    ).textContent = name;


    document.getElementById(
        "profileEmail"
    ).textContent = email;


    document.getElementById(
        "profileModalName"
    ).textContent = name;


    document.getElementById(
        "profileModalEmail"
    ).textContent = email;


    document.getElementById(
        "settingsName"
    ).value = name;


    document.getElementById(
        "settingsEmail"
    ).value = email;


    document.getElementById(
        "profileAvatar"
    ).textContent = firstLetter;


    document.getElementById(
        "topAvatar"
    ).textContent = firstLetter;


    document.getElementById(
        "largeAvatar"
    ).textContent = firstLetter;

}



function updateDate() {

    const today = new Date();


    const formatted =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );


    document.getElementById(
        "currentDate"
    ).textContent = formatted;

}



/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load tasks"
            );
        }


        tasks = await response.json();


        displayTasks();

        updateStatistics();

        updateSidebarCounts();


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        showToast(
            "Unable to load tasks.",
            true
        );

    }

}



/* =========================================================
   SIDEBAR VIEW
========================================================= */

function setView(view, button) {

    currentView = view;


    document
        .querySelectorAll(".sidebar-item")
        .forEach(item => {

            item.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    const titles = {

        all: {
            title: "My Tasks",
            subtitle:
                "Organize and track everything you need to get done."
        },

        pending: {
            title: "Pending Tasks",
            subtitle:
                "Focus on the work that still needs to be completed."
        },

        completed: {
            title: "Completed Tasks",
            subtitle:
                "Review the tasks you have successfully completed."
        }

    };


    document.getElementById(
        "taskViewTitle"
    ).textContent = titles[view].title;


    document.getElementById(
        "taskViewSubtitle"
    ).textContent = titles[view].subtitle;


    document.getElementById(
        "filterSelect"
    ).value = view;


    displayTasks();

}



/* =========================================================
   SIDEBAR COUNTS
========================================================= */

function updateSidebarCounts() {

    const total =
        tasks.length;


    const pending =
        tasks.filter(
            task => !task.completed
        ).length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    document.getElementById(
        "allCount"
    ).textContent = total;


    document.getElementById(
        "pendingCount"
    ).textContent = pending;


    document.getElementById(
        "completedCount"
    ).textContent = completed;

}



/* =========================================================
   DISPLAY TASKS
========================================================= */

function displayTasks() {

    const taskList =
        document.getElementById("taskList");


    const searchElement =
        document.getElementById("searchInput");


    const filterElement =
        document.getElementById("filterSelect");


    const searchText =
        searchElement.value
            .toLowerCase()
            .trim();


    let selectedFilter =
        filterElement.value;


    if (currentView !== "all") {

        selectedFilter = currentView;

    }


    let filteredTasks =
        tasks.filter(task => {


            const title =
                (task.title || "")
                    .toLowerCase();


            const description =
                (task.description || "")
                    .toLowerCase();


            const matchesSearch =
                title.includes(searchText) ||
                description.includes(searchText);


            let matchesFilter = true;


            if (selectedFilter === "pending") {

                matchesFilter =
                    !task.completed;

            }


            if (selectedFilter === "completed") {

                matchesFilter =
                    task.completed;

            }


            return matchesSearch &&
                   matchesFilter;

        });


    if (filteredTasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✓
                </div>

                <h3>
                    No tasks found
                </h3>

                <p>
                    ${
                        selectedFilter === "pending"
                        ?
                        "You have no pending tasks."
                        :
                        selectedFilter === "completed"
                        ?
                        "You have not completed any tasks yet."
                        :
                        "Create your first task to get started."
                    }
                </p>

            </div>

        `;

        return;
    }


    taskList.innerHTML =
        filteredTasks
            .map(task => {


                const priority =
                    task.priority || "Medium";


                const priorityClass =
                    priority.toLowerCase();


                return `

                    <div class="task-card
                        ${
                            task.completed
                            ?
                            "completed-task"
                            :
                            ""
                        }">


                        <div class="task-main">


                            <input
                                type="checkbox"
                                class="task-check"
                                ${
                                    task.completed
                                    ?
                                    "checked"
                                    :
                                    ""
                                }
                                onchange="toggleTask(${task.id})"
                            >


                            <div class="task-info">

                                <h3>
                                    ${escapeHtml(task.title)}
                                </h3>


                                <p>
                                    ${escapeHtml(
                                        task.description ||
                                        "No description"
                                    )}
                                </p>


                                <div class="task-meta">


                                    <span
                                        class="
                                            badge
                                            priority-${priorityClass}
                                        "
                                    >
                                        ${escapeHtml(priority)}
                                    </span>


                                    ${
                                        task.dueDate
                                        ?
                                        `
                                            <span
                                                class="
                                                    badge
                                                    due-date
                                                "
                                            >
                                                📅
                                                ${escapeHtml(
                                                    task.dueDate
                                                )}
                                            </span>
                                        `
                                        :
                                        ""
                                    }


                                </div>

                            </div>

                        </div>


                        <div class="task-actions">


                            <button
                                class="action-btn"
                                onclick="editTask(${task.id})"
                                title="Edit task"
                            >
                                ✏️
                            </button>


                            <button
                                class="
                                    action-btn
                                    delete-btn
                                "
                                onclick="deleteTask(${task.id})"
                                title="Delete task"
                            >
                                🗑️
                            </button>


                        </div>


                    </div>

                `;

            })
            .join("");

}



/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
        ?
        0
        :
        Math.round(
            (completed / total) * 100
        );


    document.getElementById(
        "totalTasks"
    ).textContent = total;


    document.getElementById(
        "pendingTasks"
    ).textContent = pending;


    document.getElementById(
        "completedTasks"
    ).textContent = completed;


    document.getElementById(
        "completionRate"
    ).textContent =
        `${percentage}%`;


    document.getElementById(
        "progressBar"
    ).style.width =
        `${percentage}%`;


    const productivityText =
        document.getElementById(
            "productivityText"
        );


    if (total === 0) {

        productivityText.textContent =
            "Create your first task to start tracking progress.";

    } else if (percentage === 100) {

        productivityText.textContent =
            "Everything is complete. Great work!";

    } else {

        productivityText.textContent =
            `${completed} of ${total} tasks completed. Keep going!`;

    }

}



/* =========================================================
   OPEN TASK MODAL
========================================================= */

function openTaskModal(task = null) {

    document.getElementById(
        "taskModal"
    ).style.display = "flex";


    if (task) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Task";


        document.getElementById(
            "taskId"
        ).value =
            task.id;


        document.getElementById(
            "taskTitle"
        ).value =
            task.title;


        document.getElementById(
            "taskDescription"
        ).value =
            task.description || "";


        document.getElementById(
            "taskPriority"
        ).value =
            task.priority || "Medium";


        document.getElementById(
            "taskDueDate"
        ).value =
            task.dueDate || "";

    } else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add New Task";


        document
            .getElementById("taskForm")
            .reset();


        document.getElementById(
            "taskId"
        ).value = "";

    }

}



/* =========================================================
   CLOSE TASK MODAL
========================================================= */

function closeTaskModal() {

    document.getElementById(
        "taskModal"
    ).style.display = "none";


    document
        .getElementById("taskForm")
        .reset();

}



/* =========================================================
   CREATE / UPDATE TASK
========================================================= */

document.getElementById(
    "taskForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const token =
            localStorage.getItem("token");


        const taskId =
            document.getElementById(
                "taskId"
            ).value;


        const existingTask =
            tasks.find(
                task =>
                    task.id == taskId
            );


        const taskData = {

            title:
                document.getElementById(
                    "taskTitle"
                ).value.trim(),

            description:
                document.getElementById(
                    "taskDescription"
                ).value.trim(),

            priority:
                document.getElementById(
                    "taskPriority"
                ).value,

            dueDate:
                document.getElementById(
                    "taskDueDate"
                ).value,

            completed:
                taskId && existingTask
                ?
                existingTask.completed
                :
                false

        };


        try {

            let response;


            if (taskId) {

                response = await fetch(
                    `${API_URL}/tasks/${taskId}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(taskData)

                    }
                );

            } else {

                response = await fetch(
                    `${API_URL}/tasks`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(taskData)

                    }
                );

            }


            if (!response.ok) {

                throw new Error(
                    "Task operation failed"
                );

            }


            closeTaskModal();

            await loadTasks();


            showToast(
                taskId
                ?
                "Task updated successfully."
                :
                "Task created successfully."
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to save task.",
                true
            );

        }

    }
);



/* =========================================================
   EDIT TASK
========================================================= */

function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (task) {

        openTaskModal(task);

    }

}



/* =========================================================
   DELETE TASK
========================================================= */

async function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {

        return;

    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                "Delete failed"
            );

        }


        await loadTasks();


        showToast(
            "Task deleted successfully."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to delete task.",
            true
        );

    }

}



/* =========================================================
   COMPLETE / INCOMPLETE
========================================================= */

async function toggleTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {

        return;

    }


    const token =
        localStorage.getItem("token");


    const updatedTask = {

        title:
            task.title,

        description:
            task.description,

        priority:
            task.priority,

        dueDate:
            task.dueDate,

        completed:
            !task.completed

    };


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${id}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(updatedTask)

                }
            );


        if (!response.ok) {

            throw new Error(
                "Update failed"
            );

        }


        await loadTasks();


        showToast(
            updatedTask.completed
            ?
            "Task completed!"
            :
            "Task moved back to pending."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to update task.",
            true
        );

        await loadTasks();

    }

}



/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

    const name =
        localStorage.getItem("userName") ||
        "User";

    const email =
        localStorage.getItem("userEmail") ||
        "";


    updateProfileUI(name, email);


    document.getElementById(
        "profileModal"
    ).style.display = "flex";

}



function closeProfile() {

    document.getElementById(
        "profileModal"
    ).style.display = "none";

}



function closeProfileOutside(event) {

    if (
        event.target.id ===
        "profileModal"
    ) {

        closeProfile();

    }

}



/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    const name =
        localStorage.getItem("userName") ||
        "User";

    const email =
        localStorage.getItem("userEmail") ||
        "";


    document.getElementById(
        "settingsName"
    ).value = name;


    document.getElementById(
        "settingsEmail"
    ).value = email;


    document.getElementById(
        "settingsModal"
    ).style.display = "flex";

}



function closeSettings() {

    document.getElementById(
        "settingsModal"
    ).style.display = "none";

}



function closeSettingsOutside(event) {

    if (
        event.target.id ===
        "settingsModal"
    ) {

        closeSettings();

    }

}



function saveProfileSettings() {

    const name =
        document.getElementById(
            "settingsName"
        ).value.trim();


    if (!name) {

        showToast(
            "Please enter your name.",
            true
        );

        return;

    }


    localStorage.setItem(
        "userName",
        name
    );


    const email =
        localStorage.getItem(
            "userEmail"
        ) || "";


    updateProfileUI(
        name,
        email
    );


    closeSettings();


    showToast(
        "Profile updated successfully."
    );

}



/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("userName");

    localStorage.removeItem("userEmail");


    tasks = [];

    currentView = "all";


    document.getElementById(
        "dashboardPage"
    ).style.display = "none";


    document.getElementById(
        "authPage"
    ).style.display = "none";


    document.getElementById(
        "landingPage"
    ).style.display = "block";


    document.getElementById(
        "loginForm"
    ).reset();


    showToast(
        "You have been signed out."
    );

}



/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message, error = false) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const toastIcon =
        document.getElementById("toastIcon");


    toastMessage.textContent =
        message;


    toastIcon.textContent =
        error
        ?
        "!"
        :
        "✓";


    toastIcon.style.background =
        error
        ?
        "#ef4444"
        :
        "#22c55e";


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2800);

}



/* =========================================================
   SECURITY
========================================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}



/* =========================================================
   AUTO LOGIN / INITIAL PAGE
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const token =
            localStorage.getItem("token");


        if (token) {

            showDashboard();

        } else {

            showLandingPage();

        }

    }
);