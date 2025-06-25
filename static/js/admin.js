document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/admin/staffList');
        if (!response.ok) {
            throw new Error('Failed to fetch staff list');
        }
        const staffList = await response.json();
        console.log(staffList);
        const staffListDiv = document.getElementById('staffList');
        staffListDiv.innerHTML = ''; 

        for (const key in staffList) {
            const staffDiv = document.createElement('div');
            staffDiv.classList.add('staff-member');
            staffDiv.innerHTML = `
            <a href="/admin/check_staff/${staffList[key]['staff_id']}">${staffList[key]['staff_id']} :: ${staffList[key]['staff_name']}  --> ${staffList[key]['staff_role']}</a>
            <br><br>
            `;
            staffListDiv.appendChild(staffDiv);
        }

    } catch (error) {
        console.error('Error loading staff list:', error);
    }
});
