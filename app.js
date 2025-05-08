// This file will be used for JavaScript functionalities later. 

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const addOptionsMenu = document.getElementById('addOptionsMenu');
    const createProductBtn = document.getElementById('createProductBtn');
    const createFolderBtn = document.getElementById('createFolderBtn');
    
    const itemsDisplayArea = document.getElementById('itemsDisplayArea');
    const folderInfoText = document.querySelector('.folder-info .info-text');
    const pathDisplay = document.querySelector('.path-display');
    const upButton = document.querySelector('.breadcrumb-bar .upload-btn'); 

    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewHeaders = document.getElementById('listViewHeaders');
    const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    let currentPath = '/HOME';
    // We won't store folder contents persistently in this version,
    // so navigating into a folder will show it as empty.
    // Navigating up won't restore previous items unless re-added.

    // --- Theme Switcher Logic ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeSwitcherBtn) themeSwitcherBtn.textContent = '🌙'; // Moon icon for dark
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            if (themeSwitcherBtn) themeSwitcherBtn.textContent = '☀️'; // Sun icon for light
            localStorage.setItem('theme', 'light');
        }
    }

    if (themeSwitcherBtn) {
        themeSwitcherBtn.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }
    // Load saved theme on page load
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    applyTheme(savedTheme);
    // --- End of Theme Switcher Logic ---

    // --- Search Input Logic ---
    if (searchInput && clearSearchBtn) {
        searchInput.addEventListener('input', () => {
            if (searchInput.value.length > 0) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
            }
            // TODO: Add actual search filtering logic here based on searchInput.value
            console.log('Search term:', searchInput.value);
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus(); // Put focus back in search bar
            // TODO: Reset search results display here
             console.log('Search cleared');
        });
    }
    // --- End of Search Input Logic ---

    function updatePathDisplay() {
        if (pathDisplay) {
            pathDisplay.textContent = currentPath;
        }
        if (upButton) {
            // Show upButton if not in root, hide or disable if in root.
            // For now, it's always visible, let's just ensure it works.
            // We can add class 'disabled' if currentPath === '/HOME'
        }
    }

    function clearItemsDisplayArea() {
        if (itemsDisplayArea) itemsDisplayArea.innerHTML = '';
    }

    function updateCounts() {
        if (!folderInfoText || !itemsDisplayArea) return;
        const folderCount = itemsDisplayArea.querySelectorAll('.file-item.folder').length;
        const productCount = itemsDisplayArea.querySelectorAll('.file-item.product').length;
        folderInfoText.textContent = `${folderCount} φάκελοι - ${productCount} προϊόντα`;
    }

    function handleFolderClick(folderName) {
        // In list view, clicking the name navigates. In grid view, the whole item does.
        // This event listener is on the name for list view, and on the item for grid view.
        if (currentPath === '/HOME') {
            currentPath = `/HOME/${folderName}`;
        } else {
            currentPath = `${currentPath}/${folderName}`;
        }
        clearItemsDisplayArea();
        updatePathDisplay();
        updateCounts();
        console.log(`Navigated to: ${currentPath}`);
    }

    function createFolderElement(name) {
        const folderItem = document.createElement('div');
        folderItem.classList.add('file-item', 'folder');
        folderItem.dataset.name = name;

        // 1. Checkbox (for list view)
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('item-select-checkbox');
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.addEventListener('click', e => e.stopPropagation()); // Prevent navigation if clicking checkbox
        checkboxDiv.appendChild(checkboxInput);
        folderItem.appendChild(checkboxDiv);

        // 2. Icon and Name (common part, styled differently)
        const iconNameDiv = document.createElement('div');
        iconNameDiv.classList.add('item-icon-name');
        
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('file-icon');
        iconSpan.innerHTML = '📁'; 
        iconNameDiv.appendChild(iconSpan);

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('file-name');
        nameSpan.textContent = name + ' /'; // Add trailing slash for folders in list view
        iconNameDiv.appendChild(nameSpan);
        folderItem.appendChild(iconNameDiv);
        
        // Click handling: Grid view on item, List view on nameSpan
        folderItem.addEventListener('click', (e) => {
            if (itemsDisplayArea.classList.contains('grid-view')) {
                handleFolderClick(name);
            }
        });
        nameSpan.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent item click if list-view
            if (itemsDisplayArea.classList.contains('list-view')) {
                 handleFolderClick(name);
            }
        });

        // 3. Configurations (placeholder for list view)
        const configurationsDiv = document.createElement('div');
        configurationsDiv.classList.add('item-configurations');
        configurationsDiv.textContent = '-';
        folderItem.appendChild(configurationsDiv);

        // 4. Created (placeholder for list view)
        const createdDiv = document.createElement('div');
        createdDiv.classList.add('item-created');
        createdDiv.textContent = new Date().toLocaleDateString(); // Simple date for now
        folderItem.appendChild(createdDiv);

        // 5. Share (placeholder for list view)
        const shareDiv = document.createElement('div');
        shareDiv.classList.add('item-share');
        shareDiv.textContent = '-';
        folderItem.appendChild(shareDiv);

        // 6. Actions (for list view)
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('item-actions');
        const moreOptionsBtn = document.createElement('button');
        moreOptionsBtn.classList.add('action-btn', 'more-opts');
        moreOptionsBtn.innerHTML = '⋮';
        moreOptionsBtn.addEventListener('click', e => {
            e.stopPropagation();
            console.log('More options for', name);
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('action-btn', 'delete-item');
        deleteBtn.innerHTML = '🗑️'; // Placeholder delete icon
        deleteBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${name}"?`)) {
                folderItem.remove();
                updateCounts();
                console.log('Deleted', name);
            }
        });
        actionsDiv.appendChild(moreOptionsBtn);
        actionsDiv.appendChild(deleteBtn);
        folderItem.appendChild(actionsDiv);

        return folderItem;
    }

    // --- Event Listeners for View Toggle ---
    if (listViewBtn && gridViewBtn && itemsDisplayArea && listViewHeaders) {
        listViewBtn.addEventListener('click', () => {
            itemsDisplayArea.classList.remove('grid-view');
            itemsDisplayArea.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            listViewHeaders.style.display = 'flex';
        });

        gridViewBtn.addEventListener('click', () => {
            itemsDisplayArea.classList.remove('list-view');
            itemsDisplayArea.classList.add('grid-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            listViewHeaders.style.display = 'none';
        });
    }
    
    // --- Other Event Listeners (Add menu, Create Product/Folder, Up Button) ---
    if (addBtn && addOptionsMenu) {
        addBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            addOptionsMenu.classList.toggle('show');
        });
        document.addEventListener('click', (event) => {
            if (!addOptionsMenu.contains(event.target) && !addBtn.contains(event.target)) {
                addOptionsMenu.classList.remove('show');
            }
        });
    }

    if (createProductBtn) {
        createProductBtn.addEventListener('click', () => {
            // Pass the current path as a URL parameter
            const editUrl = `edit_product.html?path=${encodeURIComponent(currentPath)}`;
            console.log(`Navigating to: ${editUrl}`);
            window.location.href = editUrl; 
            addOptionsMenu.classList.remove('show');
        });
    }

    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', () => {
            addOptionsMenu.classList.remove('show');
            const folderNameInput = prompt('Εισάγετε όνομα για το νέο φάκελο:');
            if (folderNameInput && folderNameInput.trim() !== "") {
                const trimmedName = folderNameInput.trim();
                const existingFolders = Array.from(itemsDisplayArea.querySelectorAll('.file-item.folder .file-name'))
                                          .map(el => el.textContent.replace(' /', '')); // Remove trailing slash for comparison
                if (existingFolders.includes(trimmedName)) {
                    alert(`Ένας φάκελος με το όνομα "${trimmedName}" υπάρχει ήδη εδώ.`);
                    return;
                }
                const newFolderElement = createFolderElement(trimmedName);
                if (itemsDisplayArea) {
                    itemsDisplayArea.appendChild(newFolderElement);
                    updateCounts();
                } else {
                    console.error("File grid not found!");
                }
                console.log(`Folder created: ${trimmedName} in ${currentPath}`);
            } else if (folderNameInput !== null) {
                alert('Το όνομα του φακέλου δεν μπορεί να είναι κενό.');
            }
        });
    }

    if (upButton) {
        upButton.addEventListener('click', () => {
            if (currentPath === '/HOME') {
                console.log('Already at root (/HOME)');
                return; // Cannot go up from /HOME
            }
            const parts = currentPath.split('/');
            parts.pop(); // Remove last part (current folder)
            currentPath = parts.join('/');
            if (currentPath === "") currentPath = "/HOME"; // Should not happen if parts[0] is always "HOME" after splitting from /HOME/...
            
            clearItemsDisplayArea();
            updatePathDisplay();
            updateCounts(); // Will show 0-0 for now
            console.log(`Navigated up to: ${currentPath}`);
            // TODO: In a real app, here you would fetch and display items for the new currentPath
        });
    }

    // Initial setup
    updatePathDisplay();
    updateCounts();
}); 