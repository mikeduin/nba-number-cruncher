import React from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { Button, FormInput, FormGroup, FormButton, Form, FormField, TextArea } from 'semantic-ui-react';

const TEAM_NOTES = {
  HOME: 'home_teams',
  AWAY: 'away_teams',
}

export const BoxScoreNotes = ({ gid, teamNotes, hAbb, vAbb }) => {
  const [formNotes, setFormNotes] = React.useState({
    home: {
      abb: hAbb,
      notes: teamNotes[hAbb].notes ?? '',
    },
    away: {
      abb: vAbb,
      notes: teamNotes[vAbb].notes ?? '',
    }
  });

  const handleChange = (e, { name, value }) => {
    const appliedTeam = name === TEAM_NOTES.HOME ? 'home' : 'away';
    setFormNotes({
      ...formNotes,
      [appliedTeam]: {
        ...formNotes[appliedTeam],
        notes: value,
      }
    });
  };

  const handleSubmit = async (team) => {
    const appliedTeam = team === TEAM_NOTES.HOME ? 'home' : 'away';
    const response = await axios.post('/api/updateTeamNotes',
      { abb: formNotes[appliedTeam].abb,
        notes: formNotes[appliedTeam].notes,
      }
    );
  };

  return (
    <div>
      <Form>
        <FormGroup widths='equal'>
          <FormField
            style={{minHeight: '250px'}}
            id={`game-notes-${gid}`}
            control={TextArea}
            placeholder={`${hAbb} notes`}
            name={TEAM_NOTES.HOME}
            value={formNotes.home.notes}
            onChange={handleChange}
          />
          <FormField
            style={{minHeight: '250px'}}
            id={`game-notes-${gid}`}
            control={TextArea}
            placeholder={`${vAbb} notes`}
            name={TEAM_NOTES.AWAY}
            value={formNotes.away.notes}
            onChange={handleChange}
          />
        </FormGroup>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => handleSubmit(TEAM_NOTES.HOME)}>{`Save ${hAbb} Notes`}</Button>
        <Button onClick={() => handleSubmit(TEAM_NOTES.AWAY)}>{`Save ${vAbb} Notes`}</Button>
      </div>
    </div>
  );
};