
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/tasks";

const COLUMNS = [
  { status: "TODO", title: "To do", color: "todo" },
  { status: "IN_PROGRESS", title: "In progress", color: "progress" },
  { status: "DONE", title: "Done", color: "done" },
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadTasks() {
    try {
      setError("");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load tasks");
      }

      setTasks(await response.json());
    } catch {
      setError(
        "Unable to connect to the backend. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status: "TODO",
          priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create task");
      }

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      await loadTasks();
    } catch {
      setError("Could not create the task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(task, nextStatus) {
    if (task.status === nextStatus) return;

    try {
      setUpdatingId(task.id);
      setError("");

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description || "",
          status: nextStatus,
          priority: task.priority || "MEDIUM",
          version: task.version,
        }),
      });

      if (response.status === 409) {
        await loadTasks();
        setError(
          "This task changed elsewhere. The latest tasks have been loaded. Please try again."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Could not update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch {
      setError("Could not update the task. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch {
      setError("Could not delete the task. Please try again.");
    }
  }

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    result.sort((a, b) => {
      if (sortBy === "OLDEST") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "PRIORITY") {
        return (
          (priorityOrder[b.priority] || 0) -
          (priorityOrder[a.priority] || 0)
        );
      }

      if (sortBy === "TITLE") {
        return a.title.localeCompare(b.title);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [tasks, search, statusFilter, sortBy]);

  const completed = tasks.filter((task) => task.status === "DONE").length;
  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          OpsFlow<span>.</span>
        </a>
        <span className="api-status">
          <i /> Task management
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">WORKSPACE / OVERVIEW</p>
        <h1>
          Make work <span>flow.</span>
        </h1>
        <p className="subtitle">
          One clear view of your team's tasks and progress.
        </p>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </article>
        <article className="stat-card">
          <span>In progress</span>
          <strong>{inProgress}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completed}</strong>
        </article>
      </section>

      <section className="workspace">
        <form className="panel task-form" onSubmit={addTask}>
          <p className="eyebrow">NEW ITEM</p>
          <h2>Create a task</h2>

          <label htmlFor="title">Task title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Prepare project report"
            maxLength={150}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What needs to be done?"
            rows="4"
            maxLength={2000}
          />

          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <button className="primary-button" disabled={saving}>
            {saving ? "Creating..." : "＋ Create task"}
          </button>
        </form>

        <section className="panel task-list">
          <div className="list-heading">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h2>
                Kanban board <span>{filteredTasks.length}</span>
              </h2>
            </div>
            <button
              type="button"
              className="refresh-button"
              onClick={loadTasks}
            >
              Refresh ↻
            </button>
          </div>

          <div className="task-filters">
            <label htmlFor="search">Search tasks</label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title or description..."
            />

            <div className="filter-row">
              <div>
                <label htmlFor="statusFilter">Filter by status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="ALL">All statuses</option>
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortBy">Sort tasks</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                  <option value="PRIORITY">Highest priority</option>
                  <option value="TITLE">Title A–Z</option>
                </select>
              </div>
            </div>

            <p className="filter-summary">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p className="empty-state">Loading tasks...</p>
          ) : (
            <div className="kanban-board">
              {COLUMNS.map((column) => {
                const columnTasks = filteredTasks.filter(
                  (task) => task.status === column.status
                );

                return (
                  <section
                    className={`kanban-column column-${column.color}`}
                    key={column.status}
                  >
                    <div className="kanban-column-heading">
                      <div className="column-title">
                        <span className={`column-dot dot-${column.color}`} />
                        <h3>{column.title}</h3>
                        <span className="column-count">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>

                    <div className="kanban-cards">
                      {columnTasks.length === 0 ? (
                        <div className="column-empty">
                          No tasks here yet
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <article className="task-item" key={task.id}>
                            <div className="task-main">
                              <span
                                className={`priority priority-${(
                                  task.priority || "MEDIUM"
                                ).toLowerCase()}`}
                              >
                                {task.priority || "MEDIUM"} PRIORITY
                              </span>

                              <h3>{task.title}</h3>
                              <p>
                                {task.description ||
                                  "No description provided."}
                              </p>
                              <span className="task-id">
                                TASK-{task.id}
                              </span>
                            </div>

                            <div className="kanban-card-actions">
                              <label htmlFor={`status-${task.id}`}>
                                Move task
                              </label>
                              <select
                                id={`status-${task.id}`}
                                value={task.status}
                                disabled={updatingId === task.id}
                                onChange={(event) =>
                                  updateStatus(task, event.target.value)
                                }
                              >
                                <option value="TODO">To do</option>
                                <option value="IN_PROGRESS">
                                  In progress
                                </option>
                                <option value="DONE">Done</option>
                              </select>

                              {updatingId === task.id && (
                                <span className="updating-label">
                                  Updating...
                                </span>
                              )}

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => deleteTask(task.id)}
                              >
                                Delete task
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <footer>OpsFlow · Organize work. Keep momentum.</footer>
    </main>
  );
}

export default App;
