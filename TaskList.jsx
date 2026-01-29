import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../services/Api';

const TASKS_QUERY_KEY = ['tasks'];

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newTitle) => {
      const response = await api.post('/todos', { 
        title: newTitle, 
        completed: false,
        userId: 1 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      setTitle('');
      alert('Tarefa adicionada (simulação)!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) mutation.mutate(title);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Digite uma nova tarefa..."
        style={{ padding: '8px', marginRight: '10px' }}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Adicionar'}
      </button>
    </form>
  );
};

const TaskList = () => {
  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get('/todos?_limit=10'); // Limitando a 10 itens para facilitar
      return response.data;
    },
  });

  if (isLoading) return <div>Carregando tarefas...</div>;
  if (isError) return <div>Erro: {error.message}</div>;

  return (
    <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Minhas Tarefas</h1>
      <TaskForm />
      <hr />
      <ul>
        {tasks?.map((task) => (
          <li key={task.id} style={{ marginBottom: '8px' }}>
            {task.completed ? '✅' : '❌'} {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
