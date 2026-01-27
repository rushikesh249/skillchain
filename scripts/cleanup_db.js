// Clean broken credentials and reset submissions
db.credentials.deleteMany({});
db.submissions.updateMany({ status: 'approved' }, { $set: { status: 'pending' } });
print('Database cleaned successfully');
