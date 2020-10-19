const memoruConstants = {
    db:{ 
        folders:{
            users:"memoru/users",
            lists: "lists"
        }
    },
    test:{
       userID: "test-id"
    },
    front:{
        app:{name:"Memoru", version: "1.0"}
    },
    defaultLists:{
        archive: {
            locked: true,
            name:"Archive",
            desc:"System Archive",
            counts:{ total:0 }
        },
        trash: {
            locked: true,
            name:"Trash",
            desc:"System Trash",
            counts:{ total:0 }
        },
        default: {
            locked: true,
            name:"Default",
            desc:"System Default",
            counts:{ total:0 }
        }
    }
};
