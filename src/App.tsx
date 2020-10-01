import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations'

const initialFormState = { name: '', description: '' }

export type IToDo = {
  id: string
  name: string
  description: string
}
export type getNotes = {
  listNotes: {
    items: IToDo[]
  }
}

function App() {

  const [notes, setNotes] = useState([] as any);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try{
      console.log('fetching notes.. started')
      const apiData = await API.graphql({ query: listNotes }) as {data : getNotes};
      console.log('notes fetched ', JSON.stringify(apiData))
      setNotes(apiData.data.listNotes.items);
    }catch(e) {
      console.log('error fetching notes ', e)
    }

  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }  

  async function deleteNote(id: any) {
    console.log('note to be deleted ', id)
    const newNotesArray = notes.filter((note: { id: any; }) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }  

  return (
    <div className="App">

        <h1>My Notes App</h1>
        <input
          onChange={e => setFormData({ ...formData, 'name': e.target.value})}
          placeholder="Note name"
          value={formData.name}
        />
        <input
          onChange={e => setFormData({ ...formData, 'description': e.target.value})}
          placeholder="Note description"
          value={formData.description}
        />


          <button onClick={createNote}>Create Note</button>
          <div style={{marginBottom: 30}}>
          {
            notes.map((note: { id: any; name: React.ReactNode; description: React.ReactNode; }) => (
              <div key={note.id || note.name}>
                <h2>{note.id} {note.name}</h2>
                <p>{note.description}</p>
                <button onClick={() => deleteNote(note.id)}>Delete note</button>
              </div>
            ))
          }
        </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
