export const getSender = (loggedUser, users) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    console.error('Invalid users:', users);
    return 'Unknown Sender';
  }

  if (!loggedUser || !loggedUser._id) {
    console.error('Invalid loggedUser:', loggedUser);
    return 'Unknown Sender';
  }

  return users[0]._id === loggedUser._id ? users[1]?.name : users[0]?.name;
};

export const getSenderFull = (loggedUser, users) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    console.error('Invalid users:', users);
    return 'Unknown Sender';
  }

  if (!loggedUser || !loggedUser._id) {
    console.error('Invalid loggedUser:', loggedUser);
    return 'Unknown Sender';
  }

  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSenderMargin = (messages, m, i, userId) => {

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};