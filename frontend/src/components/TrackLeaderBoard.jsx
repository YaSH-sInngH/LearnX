import React, { useEffect, useState } from 'react';
import { getTrackLeaderboard } from '../api/profile';

export default function TrackLeaderboard({ trackId }) {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => {
    getTrackLeaderboard(trackId).then(setLeaders);
  }, [trackId]);
  return (
    <div className="card p-4">
      <h3 className="font-bold mb-2">Top Learners</h3>
      <ol>
        {leaders.map((entry, i) => (
          <li key={entry.user.id} className="flex items-center space-x-2 mb-1">
            <span className="font-bold">{i + 1}.</span>
            <img src={entry.user.avatarUrl || '/default-avatar.png'} alt="" className="w-6 h-6 rounded-full" />
            <span>{entry.user.name}</span>
            <span className="ml-auto text-xs text-gray-500">{entry.progress}%</span>
            <span className="ml-2 text-xs text-blue-600">{entry.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
