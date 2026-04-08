export const getStatus = (req, res) => {
    res.json({ status: 'Online', message: 'MediGuide Backend is running successfully!' });
};
