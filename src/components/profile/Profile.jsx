import React from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { username } = useParams();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{username}'s Profile</h1>
      <p>Profile page coming soon...</p>
    </div>
  );
};

export default Profile;