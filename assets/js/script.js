//connect variables to input elements on html form
const taskCardEl = $(".task-card");
const taskTitleInputEl = $("#task-title-input");
const taskDueDateInputEl = $("#task-due-date-input");
const taskDescriptionInputEl = $("#task-description-input");
const taskFormEl = $("#task-form");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let uuid = "";

function readTasksFromStorage() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    return tasks;
}

// save to localStorage
function saveTasksToStorage(tasks) {
    const tasksStr = JSON.stringify(tasks);
    localStorage.setItem("tasks", tasksStr);
};

// Todo: create a function to generate a unique task id
function generateTaskId() {
    uuid = crypto.randomUUID();
    return uuid;
}

// Todo: create a function to create a task card
function createTaskCard(task) { 
    // create the elements of the card: task name, due date, and description
    const taskCard = $("<div>");
    taskCard.addClass("task-card task-card:hover draggable my-3");
    taskCard.attr("data-task-id", task.id);
    const cardHeader = $("<div>").addClass("card-title h2").text(task.title);
    const cardBody = $("<div>").addClass("card-body");
    const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
    const cardDescription = $("<p>").addClass("card-text").text(task.description);
    const cardDeleteBtn = $("<button>").addClass("btn btn-outline-danger").text("Delete").attr("data-task-id", task.id);
    cardDeleteBtn.on("click", handleDeleteTask);
        
        // set card background color based on date
        if (task.dueDate && task.status !== 'done') {
            const now = dayjs();
            const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

            // If the task is due today, make the card yellow. If it is overdue, make it red.
            if (now.isSame(taskDueDate, "day")) {
                taskCard.addClass("bg-warning text-black");
            } else if (now.isAfter(taskDueDate)) {
                taskCard.addClass("bg-danger text-white");
                cardDeleteBtn.addClass("border-light text-white");
            }
        }

    cardBody.append(cardDueDate, cardDescription, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);
    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();

    // clear current data in card lanes
    const todoList = $("#todo-cards");
    todoList.empty();

    const inProgressList = $("#in-progress-cards");
    inProgressList.empty();

    const doneList = $("#done-cards");
    doneList.empty();

    // assign card to correct lane depending on status
    for (let task of tasks) {
        const taskCard = createTaskCard(task);
        if (task.status === "to-do") {
            todoList.append(taskCard);
        } else if (task.status === "in-progress") {
            inProgressList.append(taskCard);
        } else if (task.status === "done") {
            doneList.append(taskCard);
        }
    };

    $(".draggable").draggable({
        opacity:0.7,
        helper: function(e) {
            const original = $(e.target).hasClass("ui-draggable")
                ? $(e.target)
                : $(e.target).closest(".ui-draggable");
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(){
    const taskId = $(this).attr("data-task-id");
    const tasks = readTasksFromStorage();
  
    tasks.forEach((task) => {
        if (task.id === taskId) {
            tasks.splice(tasks.indexOf(task), 1);
        }
    });

    saveTasksToStorage(tasks);
    renderTaskList();
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    const taskTitle = taskTitleInputEl.val();
    const taskDueDate = taskDueDateInputEl.val();
    const taskDescription = taskDescriptionInputEl.val();

    // write task-value variables to new task array
    const myTask = {
        id: generateTaskId(),
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        status: "to-do",
    };

    const tasks = readTasksFromStorage();
    tasks.unshift(myTask);
    saveTasksToStorage(tasks);
    renderTaskList();

    taskTitleInputEl.val("");
    taskDueDateInputEl.val("");
    taskDescriptionInputEl.val("");
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const tasks = readTasksFromStorage();

    // identify which card was dragged
    const taskId = ui.draggable[0].dataset.taskId;

    // identify into which lane the card was dropped
    const newStatus = event.target.id;
    

    for(let task of tasks) {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    };
    saveTasksToStorage(tasks);
    renderTaskList();
}

// event listener for submit event on form
taskFormEl.on('submit', handleAddTask);

// event listener for click event on card delete button
taskCardEl.on("click", function(event) {
    if(event.target.tagName === "card-body") {
    handleDeleteTask}});

// ------------------- main -------------------- //
// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function() {
    var bootstrapButton = $.fn.button.noConflict()
    $.fn.bootstrapBtn = bootstrapButton;


    if (tasks.length !== 0) {
        renderTaskList();
    };

    // create the dialog box using the jQuery UI dialog widget but don't show it yet make lanes droppable
    $('.lane').droppable({
        accept: ".draggable",
        drop: handleDrop,
    });

    //make date input datepicker
    $("#task-due-date-input").datepicker ({
        changeMonth: true,
        changeYear: true,
    });

    // creates the dialog box for user input
    let dialog = $("#task-form").dialog({
        autoOpen: false,
        modal: true,
        minWidth:500,
        buttons: {
            "Save Task": function() {
                if (taskTitleInputEl.val() === "" || taskDueDateInputEl.val() === "" || taskDescriptionInputEl.val() === "") {
                    alert("Please complete all fields.");
                    return;
                } else {
                    $(this).dialog("close");
                    handleAddTask();
                }
            }
        }
    });

    // show the dialog box when the add-task button on the main page is clicked
    $("#add-task").on("click", function() {
        dialog.dialog("open");
    });
});