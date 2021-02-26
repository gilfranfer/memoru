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
        sorting: { tasks: [{field:"name", desc:"Task name", reverse:true},{field:"type", desc:"Task type", reverse:true},
								{field:"createdOn", desc:"Creation", reverse:true},{field:"dueDate", desc:"Due Date", reverse:true}] }
    }
};
