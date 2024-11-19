import { useState, useRef, useEffect } from 'react';
import './App.css';

let initialTodos = [
  { id: 0, title: 'Learn React', done: true },
  { id: 1, title: 'Make dinner', done: false },
  { id: 2, title: 'Take a shower', done: false },
  { id: 3, title: 'Brush my teeth', done: false },
];

function App() {
  const [todos, setTodos] = useState(initialTodos);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const pendingTodos = todos.filter((todo) => !todo.done).length;
  let allTodos = todos.filter(todo => todo);
  let completedTodos = todos.filter(todo => todo.done);
  let activeTodos = todos.filter(todo => !todo.done);
  const [theme, setTheme] = useState("light");

  const filteredTodos = todos.filter((todo) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return !todo.done
    if (selectedFilter === 'completed') return todo.done

  });

  function handleOnAddTodo(title) {
    setTodos([
      ...todos,
      { id: Date.now(), title: title, done: false }
    ]);
  }

  function handleOnCheckTodo(todoId, isChecked) {
    setTodos(
      todos.map((todo) => {
        if (todo.id === todoId) {
          return {
            ...todo,
            done: isChecked,
          };
        } else {
          return todo;
        }
      })
    );
  }
  function handleSelectedFilter(filter){
    setSelectedFilter(filter);
  }

  function handleOnDeleteTodo(todoId) {
    setTodos(todos.filter((todo) => todo.id !== todoId));
  }
  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.done));
  }

  function toggleDark(){
    const doc = document.body;
    doc.classList.toggle('dark-theme');
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <>
      <header>
        <h1>TODO</h1>
        <a onClick={toggleDark}><span className={theme === "light" ? "icon light-icon" : "icon dark-icon"}></span></a>
      </header>
      <AddTodo onAddTodo={handleOnAddTodo} />
      <section className="todos-controls">
        <TodosList
          list={filteredTodos}
          onCheckTodo={handleOnCheckTodo}
          onDeleteTodo={handleOnDeleteTodo}
          onSetList={setTodos}
        />
        <section className='controls'>
          {pendingTodos} Items left{' '}
          <div>
            <a style={{color: selectedFilter === 'all' && '#487fff' }} onClick={() => handleSelectedFilter('all')}>All </a>
            <a style={{color: selectedFilter === 'active' && '#487fff' }} onClick={() => handleSelectedFilter('active')}>Active </a>
            <a style={{color: selectedFilter === 'completed' && '#487fff' }} onClick={() => handleSelectedFilter('completed')}>Completed</a>
          </div>
          <a onClick={clearCompleted}>Clear Completed</a>
        </section>
      </section>
    </>
  );
}

function TodosList({ list, onCheckTodo, onDeleteTodo, onSetList }) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [reorderedList, setReorderedList] = useState(list);
  const itemRefs = useRef([]);

  useEffect(() => {
    setReorderedList(list); // Update list on changes
  }, [list]);

  const getItemOffset = (index) => {

    const itemRef = itemRefs.current[index];
    if (!itemRef) return index * 55; // Fallback to prevent undefined access
    const itemHeight = itemRef.offsetHeight;
    return index * (itemHeight); // Add a 10px margin for spacing
  };

  // Handle drag start
  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  // Handle drag over and calculate movement
  const handleDragOver = (e, hoverIndex) => {
    e.preventDefault();

    const draggedIndex = draggedItemIndex;
    if (draggedIndex !== hoverIndex) {
      const newList = [...reorderedList];
      const draggedItem = newList[draggedIndex];

      // Remove the dragged item and insert it at the hovered index
      newList.splice(draggedIndex, 1);
      newList.splice(hoverIndex, 0, draggedItem);

      setReorderedList(newList); // Update reordered list
      setDraggedItemIndex(hoverIndex); // Update dragged index
    }
  };

  // Finalize drag and drop
  const handleDrop = () => {
    onSetList(reorderedList);  // Finalize the reorder on drop
    setDraggedItemIndex(null); // Reset dragged index
  };

  return (
    <ul style={{ 
      position: 'relative', 
      padding: '0 24px',
      height: reorderedList.length * 55 + 'px'
      }}>
      {reorderedList.map((todo, index) => {
        const ref = (el) => itemRefs.current[index] = el;
        const isBeingDragged = draggedItemIndex === index;

        return (
          <li
            key={todo.id}
            ref={ref}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            style={{
              position: 'absolute', // Absolutely position items
              top: getItemOffset(index) + 'px', // Calculate item position
              left: 0,
              listStyle: 'none',
              borderBottom: '1px solid rgba(211, 211, 211, 0.2)',
              // border: '1px solid #25273D',
              // borderColor: isBeingDragged ? 'lightblue' : '#25273D',
              transition: 'top 0.5s ease', // Smooth transition on position change
              // transform: isBeingDragged ? 'scale(1.05)' : 'none', // Slightly scale the dragged item
            }}
          >
              <label className="todo-wrapper" style={{
                cursor: 'move',
                textDecoration: todo.done && 'line-through',
                color: todo.done && 'gray',
              }}>
                <input
                id={"check" + todo.id}
                type="checkbox"
                checked={todo.done}
                onChange={(e) => onCheckTodo(todo.id, e.target.checked)}
                />
                <label htmlFor={"check" + todo.id}></label>
                <span className='todo-title'>{todo.title}</span>
              </label>
            <a onClick={() => onDeleteTodo(todo.id)}>&times;</a>
          </li>
        );
      })}
    </ul>
  );
}

function AddTodo({ onAddTodo }) {
  const [name, setName] = useState('');

  function handleEnterAndClick() {
    setName('');
    onAddTodo(name);
  }

  return (
    <>
      <section className='todo-input'>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Create a new todo...'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleEnterAndClick();
            }
          }}
        />
      </section>
      
    </>
  );
}

export default App;