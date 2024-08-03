
type Priority = "LOW" | "HIGH"

interface Task {
    id: string;
    priority: Priority;
    callback: () => void;
}

class Scheduler {
    private tasks: Task[] = [];
    private is_waiting: boolean = false;
    


    public addTask(id: string, priority: Priority, callback: () => void) {
        this.tasks.push({ id, priority, callback });
    }

    public runTasks() {
        this.tasks
            .sort((a, b) => (a.priority === "HIGH" ? -1 : 1))
            .forEach((task) => task.callback());
    }

}