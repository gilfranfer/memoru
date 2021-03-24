const languages = {
    english: {
        menu:{login:"Log in", logout: "Log out", register:"Register",preferences:"My Preferences"},
        labels:{tasks:"Tasks"},
        btns:{
            saveBtn:"Save", openBtn:"Open", return:"Return to Taskboard",
            close:"Complete", archive: "Archive", reopen:"Reopen", delete: "Delete",
            yes:"Yes", no: "No"
        },
        sorting:{sortLbl:"Sort by"},
        lists:{
            addTitle:"Manage your Lists", addHint:"Type something here ...", addBtnTooltip:"Add as List",
            addDesc:"Type to find a list or create a new one", alreadyExist:"A list with that name already exist.", 
            created:"A new list has been created!", createdOn:"Created on:", 
            updated:"List Updated!", deleted: "The list was deleted!",
            tasksInList:"Tasks exist in this list.", listLbl:"List"
        },
        tasks:{ 
            editTitle: "Task Details", 
            title:"'s Task board", addHint:"Type to find or create a Task", addBtnTooltip:"Add this Task",
            tasknameHint:"What's the task?", taskdescHint:"Add more details to your task",
            openTasks: "Pending Tasks", closedTasks: "Completed Tasks", 
            openLbl: "Pending", closedLbl: "Completed", 
            taskLbl: "Task", tasksLbl:"Tasks", notasksLbl:"No Tasks",
            taskType: "Task", goalType: "Goal", dueOn:"Due On: ",
            goalCurrent:"Goal Current", goalEnd:"Goal End", goalUpdate:"Decrease / Increase by",
            created:"A new task has been created!", createdOn:"Created on:",
            deleted:"The task was deleted!", closed:"You completed a Task!", reopened: "Your task is pending, again.",
            updated:"Task Updated!", goalError:"Goal current value must be lower than Goal End",
            taskInArchive:"This Task is currently Archived", taskCompleted: "This task was Completed!",
            notANumber: "Value is not a number", decrementSurpass:"Decrement would fall below zero.", incrementSurpass:"Increment would surpass the Goal.",
            commentsTitle:"Task Comments", noComments: "This task does not have comments, yet.", commentHint:"Add some comments or notes to your task."
        },
        pref:{
            title:"Preferences", 
            initListTitle:"Select the Initial Active List", initListDesc:"The list you want to be selected when opening Memoru",
            sortByTitle:"Sort tasks by", sortByDesc: "Select the default sorting for yout tasks list",
            duedateTitle:"Show Due date", duedateDesc: "Display the due date in the Task list",
            progressBarTitle:"Show Progress bar", progressBarDesc: "Display the progress bar in the Task list",
            progressValTitle:"Show Progress value", progressValDesc: "Display the progress value on top of the bar",
            progressTypeTitle:"Progress value as", progressTypeDesc: "Display the progress value as Percentage or Detail", 
            typePerc: "Percentage %", typeDesc: "Detail x/y", saved:"Preferences Saved!",
            uiModeTitle:"Interface style", uiModeDesc:"",
            uiModeDark:"Dark style", uiModeLight:"Light Mode", uiModeAuto:"Auto"
        },
        auth:{
            loginTitle: "Login", emailLbl:"Type your Email", emailHint:"email@domain.com", invalidEmail:"Invalid email",
            pwdLbl:"Password", pwdConfirmLbl:"Confirm Password", pwdHint:"Shhh...", 
            forgotPwd: "Reset password", invalidPwd:"Invalid Password", pwdMatch:"Passwords must match",
            registerBtn:"Register", loginBtn:"Login", pwdRule:"Include 8+ combination of numbers, lower and upper case letters",
            regiserTitle:"Register", readPolicy: "I have read, and agree with the", privacyPolicy: "Privacy Policy",
            regWip:"Creating Account...", regDone:"Account Created!", confWip:"Configuring Account...",
            nameLbl:"Name", nameHint:"FernandoGil", nameRule:"Only letters", invalidName:"Invalid Name",
            verificationEmailSent:"Email sent, please check your mailbox", sendVerificationEmail:"Send Verification Email",
            emailNotVerified:"Your email has not been verified.", resetPwdEmail:"Email sent to reset password", loginError:"Invalid email/password"
        },
        alerts:{
            listDelete:"When deleting a list, all Open Tasks will be moved to 'Default' list.",
        }
    },
    spanish: {

    }
};