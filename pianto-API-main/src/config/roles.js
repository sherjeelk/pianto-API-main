const roles = ['user', 'admin', 'service'];

const roleRights = new Map();
roleRights.set(roles[0], ['user', 'getUsers']);
roleRights.set(roles[1], ['user','getUsers', 'manageUsers']);
roleRights.set(roles[2], ['user','getUsers']);

module.exports = {
  roles,
  roleRights,
};
