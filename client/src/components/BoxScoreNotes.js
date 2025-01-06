import React from 'react'
import axios from 'axios';
import { Button, FormInput, FormGroup, FormButton, Form, FormField, TextArea } from 'semantic-ui-react'

export const BoxScoreNotes = ({ gid, notes, hAbb, vAbb }) => {
  const [formNotes, setFormNotes] = React.useState(notes);

  const handleChange = (e, { name, value }) => {
    console.log('name:', name, 'value:', value);
    // setFormNotes(value);
  }

  const handleSubmit = async () => {
    console.log('submitting notes:', formNotes);
    const response = await axios.post('/api/updateTeamNotes', {gid, notes: formNotes});
  }

  return (
    <div>
      <Form>
        <FormGroup widths='equal'>
          <FormField
            id={`game-notes-${gid}`}
            control={TextArea}
            placeholder='notes'
            name='homeNotes'
            value={formNotes}
            onChange={handleChange}
            // style={{minWidth: 1200}}
          />
          <FormField
            id={`game-notes-${gid}`}
            control={TextArea}
            placeholder='notes'
            name='awayNotes'
            value={formNotes}
            onChange={handleChange}
            // style={{minWidth: 1200}}
          />
        </FormGroup>
      </Form>
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <Button>Save xx Notes</Button>
      <Button>Save yy Notes</Button>
    </div>
    </div>
  )
}