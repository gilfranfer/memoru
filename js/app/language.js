const languages = {
    english: {
        menu:{login:"Log in", logout: "Log out", register:"Register"},
        labels:{tasks:"Tasks"},
        lists:{
            addTitle:"Manage your Lists", addHint:"Type something here ...", addBtnTooltip:"Add as List",
            addDesc:"Type to find a list or create a new one", alreadyExist:"A list with that name already exist.", 
            created:"A new list has been created!", createdOn:"Lista creada en: ", 
            updated:"List Updated!", deleted: "The list was deleted!",
            tasksInList:"Tasks exist in this list.", editBtnTooltip:"Guardar cambios"
        },
        tasks:{ 
            title:"'s Task board", addHint:"Type your task here ...", addBtnTooltip:"Add this Task",
            addDesc:"Type to find a task or create a new one",
            created:"A new task has been created!"
        },
        alerts:{
            listDelete:"When deleting a list, all Open Tasks will be moved to 'Default' list."
        }
    },
    spanish: {
        menu:{login:"Iniciar sesión", logout: "Cerrar sesión", register:"Registro"},
        labels:{tasks:"Tareas"},
        lists:{addTitle:"Administra tus Listas", addHint:"Escribe algo ...", addBtnTooltip:"Agregar como Lista",
                addDesc:"Escribe para encontrar una lista o crear una nueva", alreadyExist:"Ya existe una lista con ese nombre.",
                created:"Una nueva lista fue creada!", createdOn:"List created on: ", 
                updated:"Lista Actualizada!", deleted:"La lista ha sido eliminada.",
                tasksInList:"Tareas existen en esta lista.", editBtnTooltip:"Update List"
        },
        tasks:{ 
            title:", tus Tareas son", addHint:"Escribe tu Tarea ...", addBtnTooltip:"Crear Tarea",
            addDesc:"Escribe para encontrar una Tarea o crear una nueva",
            created:"Una nueva Tarea fue creada!"
        },
        tasks:{ title:"", addHint:"Escribe algo ...", created:"Una nueva tarea fue creada!"},
        alerts:{
            listDelete:"Al eliminar una lista, todas sus Tareas Abiertas serán movidas a la lista 'Default'."
        }
    }
};