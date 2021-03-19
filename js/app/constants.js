const memoruConstants = {
    db:{ 
        collections:{
            userlists:"lists", ownedlists:"owned",
            userTasks:"tasks", ownedTasks:"owned"
        },
        folders:{
            users:"memoru/users",
            mylists: "lists/owned",
            collablists: "lists/collab"
        },
        fields:{
            listname:"name"
        }
    },
    test:{
       userID: "test-id", username:"Test User"
    },
    front:{
        app:{name:"Memoru", version: "1.0"},
        sorting: { tasks: [{field:"name", desc:"Task name"},{field:"type", desc:"Task type"},
								{field:"createdOn", desc:"Creation"},{field:"duedate", desc:"Due Date"}] }
    }
};

const defaultPreferences = {
    // preferences: { 
        lists:{ initialActivelistId: "default" },
        tasks:{ sorting:{field:"createdOn", desc:"Creation"}, showDuedate: true },
        goals:{ showBar: true, showProgress:true, progressOn:"desc"/*"perc"*/   }
    // }
}