import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/Api';

const TASKS_QUERY_KEY = ['tasks'];

const TaskList = () => {
  const [newTitle, setNewTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get('/todos?_limit=10');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (title) => api.post('/todos', { title, completed: false, userId: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      setNewTitle('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (task) => api.patch(`/todos/${task.id}`, { completed: !task.completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/todos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY }),
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTitle.trim()) createMutation.mutate(newTitle);
  };

  if (isLoading) return <div className="loader">Carregando...</div>;
  if (isError) return <div className="error">Erro: {error.message}</div>;

  return (
    <div className="task-container">
      <h1>Gerenciador de Tarefas</h1>
      
      <form onSubmit={handleAdd} className="task-form">
        <input 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="O que precisa ser feito?"
        />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? '...' : 'Adicionar'}
        </button>
      </form>

      <ul className="task-list">
        {tasks?.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
            <div className="task-content" onClick={() => updateMutation.mutate(task)}>
              <span className="checkbox-icon">{task.completed ? '✅' : '⭕'}</span>
              <span className="title">{task.title}</span>
            </div>
            <button 
              className="btn-delete" 
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate(task.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '...' : 'Excluir'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
