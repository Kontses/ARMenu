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
    const headerTitleLink = document.getElementById('headerTitleLink');

    // Bulk Actions Bar Elements
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    const selectionInfoText = document.getElementById('selectionInfoText');
    const bulkMoveBtn = document.getElementById('bulkMoveBtn');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const listHeaderCheckbox = document.getElementById('listHeaderCheckbox'); // Checkbox κεφαλίδας λίστας

    let currentPath = '/HOME';
    let selectedItems = new Set(); // To store the names/ids of selected items
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
        folderItem.dataset.name = name; // Use name as a unique ID for selection tracking

        // 1. Checkbox (for list view AND grid view)
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('item-select-checkbox');
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.addEventListener('click', e => {
            e.stopPropagation(); // Prevent navigation or other item clicks
            if (checkboxInput.checked) {
                selectedItems.add(folderItem.dataset.name);
            } else {
                selectedItems.delete(folderItem.dataset.name);
            }
            updateUIOnSelectionChange();
        });
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
        nameSpan.textContent = name + (itemsDisplayArea.classList.contains('list-view') ? ' /' : ''); // Add trailing slash for folders in list view based on current view
        iconNameDiv.appendChild(nameSpan);
        folderItem.appendChild(iconNameDiv);
        
        nameSpan.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (itemsDisplayArea.classList.contains('list-view')) {
                 handleFolderClick(folderItem.dataset.name);
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

        // 6. Actions / Three Dots Menu
        const threeDotsBtn = document.createElement('button');
        threeDotsBtn.classList.add('item-action-dots-btn');
        threeDotsBtn.innerHTML = '⋮';
        threeDotsBtn.style.display = 'none'; // Hidden by default, shown on item hover

        const contextMenu = document.createElement('div');
        contextMenu.classList.add('item-context-menu');

        const enterOption = document.createElement('button');
        enterOption.innerHTML = '<span class="menu-icon-svg"><!-- Optional: SVG for Enter --></span> Enter';
        enterOption.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFolderClick(name);
            contextMenu.classList.remove('visible');
            threeDotsBtn.style.display = 'none';
        });

        const moveOption = document.createElement('button');
        moveOption.innerHTML = '<span class="menu-icon-svg"><!-- Optional: SVG for Move --></span> Move';
        moveOption.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Move folder: ${name}`);
            alert(`Move functionality for "${name}" to be implemented.`);
            contextMenu.classList.remove('visible');
            threeDotsBtn.style.display = 'none';
        });

        const renameOption = document.createElement('button');
        renameOption.innerHTML = '<span class="menu-icon-svg"><!-- Optional: SVG for Rename --></span> Rename';
        renameOption.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentName = folderItem.dataset.name; // Get current name from dataset
            const newNameInput = prompt(`Enter new name for "${currentName}":`, currentName);
            if (newNameInput && newNameInput.trim() !== "" && newNameInput.trim() !== currentName) {
                const trimmedNewName = newNameInput.trim();
                // Check for duplicates in the current view before renaming
                const existingNames = Array.from(itemsDisplayArea.querySelectorAll('.file-item'))
                                         .map(item => item.dataset.name)
                                         .filter(n => n !== currentName); // Exclude current item from check
                if (existingNames.includes(trimmedNewName)) {
                    alert(`An item with the name "${trimmedNewName}" already exists here.`);
                    contextMenu.classList.remove('visible');
                    threeDotsBtn.style.display = 'none';
                    return;
                }

                // Update UI (nameSpan and dataset.name)
                nameSpan.textContent = trimmedNewName + (itemsDisplayArea.classList.contains('list-view') ? ' /' : '');
                folderItem.dataset.name = trimmedNewName;
                console.log(`Renamed folder: ${currentName} to ${trimmedNewName}`);
            }
            contextMenu.classList.remove('visible');
            threeDotsBtn.style.display = 'none';
        });

        const deleteOption = document.createElement('button');
        deleteOption.innerHTML = '<span class="menu-icon-svg"><!-- Optional: SVG for Delete --></span> Delete';
        deleteOption.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${folderItem.dataset.name}"?`)) {
                folderItem.remove();
                updateCounts();
                console.log(`Deleted folder: ${folderItem.dataset.name}`);
            }
            contextMenu.classList.remove('visible');
            // threeDotsBtn is part of folderItem, so it gets removed too. No need to hide it explicitly here.
        });

        contextMenu.appendChild(enterOption);
        contextMenu.appendChild(moveOption);
        contextMenu.appendChild(renameOption);
        contextMenu.appendChild(deleteOption);

        // Το threeDotsBtn και το contextMenu γίνονται απευθείας παιδιά του folderItem
        folderItem.appendChild(threeDotsBtn);
        folderItem.appendChild(contextMenu);

        // Προσθέτουμε ένα (πιθανώς κενό) div για τη στήλη item-actions στη λίστα,
        // για να διατηρηθεί η σωστή διάταξη των στηλών.
        const actionsColumnPlaceholder = document.createElement('div');
        actionsColumnPlaceholder.classList.add('item-actions');
        // actionsColumnPlaceholder.appendChild(threeDotsBtn); // ΌΧΙ ΠΛΕΟΝ ΕΔΩ
        folderItem.appendChild(actionsColumnPlaceholder);

        // Event listeners for showing/hiding dots and menu
        folderItem.addEventListener('mouseenter', () => {
            threeDotsBtn.style.display = 'inline-flex'; // Use inline-flex or block based on styling
        });

        folderItem.addEventListener('mouseleave', () => {
            // Don't hide dots if context menu is visible
            if (!contextMenu.classList.contains('visible')) {
                threeDotsBtn.style.display = 'none';
            }
        });
        
        threeDotsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other context menus
            document.querySelectorAll('.item-context-menu.visible').forEach(menu => {
                if (menu !== contextMenu) {
                    menu.classList.remove('visible');
                    const otherItem = menu.closest('.file-item');
                    if (otherItem) {
                        const otherDots = otherItem.querySelector('.item-action-dots-btn');
                        if (otherDots) otherDots.style.display = 'none';
                    }
                }
            });
            contextMenu.classList.toggle('visible');
            if (!contextMenu.classList.contains('visible')) { // If menu was closed by toggle
                 threeDotsBtn.style.display = 'none'; // Hide dots too
            }
        });
        
        // Clicking on folderItem itself (but not on a button within it) should close an open menu
        folderItem.addEventListener('click', (e) => {
            // Check if the click is on the item itself, or its direct children icon/name,
            // and NOT on any button (like the three-dots button or buttons inside the context menu)
            if ((e.target === folderItem || nameSpan.contains(e.target) || iconSpan.contains(e.target)) && !e.target.closest('button, .item-context-menu')) {
                // Close context menu if it's open
                if (contextMenu.classList.contains('visible')) {
                    contextMenu.classList.remove('visible');
                    threeDotsBtn.style.display = 'none';
                }

                // Proceed with navigation ONLY for grid-view here
                if (itemsDisplayArea.classList.contains('grid-view')) {
                     handleFolderClick(folderItem.dataset.name);
                } 
                // Η πλοήγηση για list-view γίνεται από τον ξεχωριστό listener του nameSpan

            } else if (contextMenu.classList.contains('visible') && !contextMenu.contains(e.target) && !threeDotsBtn.contains(e.target)) {
                // If menu is open and click is outside menu and outside dots button, close it.
                contextMenu.classList.remove('visible');
                threeDotsBtn.style.display = 'none';
            }
        });


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

    // Global click listener to close any open context menu
    document.addEventListener('click', (e) => {
        const openContextMenu = document.querySelector('.item-context-menu.visible');
        if (openContextMenu) {
            const associatedItem = openContextMenu.closest('.file-item');
            // If the click is outside the associated item of the open menu
            if (associatedItem && !associatedItem.contains(e.target)) {
                openContextMenu.classList.remove('visible');
                const dotsBtn = associatedItem.querySelector('.item-action-dots-btn');
                if (dotsBtn) {
                    dotsBtn.style.display = 'none';
                }
            }
        }
        // Close addOptionsMenu if click is outside
        if (addOptionsMenu && addOptionsMenu.classList.contains('show') && !addOptionsMenu.contains(e.target) && !addBtn.contains(e.target)) {
            addOptionsMenu.classList.remove('show');
        }
    });

    // --- Event Listener for Header Title Link to Home --- 
    if (headerTitleLink) {
        headerTitleLink.addEventListener('click', () => {
            if (currentPath === '/HOME') {
                // Already at home, maybe do nothing or a subtle visual cue
                console.log("Already at /HOME");
                return;
            }
            currentPath = '/HOME';
            clearItemsDisplayArea();
            updatePathDisplay();
            updateCounts(); // Will show 0-0 as no items are re-rendered by default
            console.log("Navigated to /HOME via title click");
            // TODO: Optionally, re-render any default items for /HOME if there are any.
        });
    }

    // --- Function to update the state of the Bulk Actions Bar AND list header checkbox ---
    function updateUIOnSelectionChange() {
        const numSelected = selectedItems.size;
        if (numSelected > 0) {
            bulkActionsBar.style.display = 'flex';
            selectionInfoText.textContent = `${numSelected} item${numSelected > 1 ? 's' : ''} selected`;
            bulkMoveBtn.disabled = false;
            bulkDeleteBtn.disabled = false;
        } else {
            bulkActionsBar.style.display = 'none';
            selectionInfoText.textContent = '';
            bulkMoveBtn.disabled = true;
            bulkDeleteBtn.disabled = true;
        }

        const allVisibleItemCheckboxes = Array.from(itemsDisplayArea.querySelectorAll('.file-item input[type="checkbox"]'));
        const allVisibleItemsCount = allVisibleItemCheckboxes.length;

        selectAllBtn.textContent = (allVisibleItemsCount > 0 && numSelected === allVisibleItemsCount) ? 'Deselect all' : 'Select all';

        if (listHeaderCheckbox && itemsDisplayArea.classList.contains('list-view')) {
            if (allVisibleItemsCount === 0) { // No items in list view
                 listHeaderCheckbox.checked = false;
                 listHeaderCheckbox.indeterminate = false;
            } else {
                const numSelectedInList = allVisibleItemCheckboxes.filter(cb => cb.checked).length;
                if (numSelectedInList === 0) {
                    listHeaderCheckbox.checked = false;
                    listHeaderCheckbox.indeterminate = false;
                } else if (numSelectedInList === allVisibleItemsCount) {
                    listHeaderCheckbox.checked = true;
                    listHeaderCheckbox.indeterminate = false;
                } else {
                    listHeaderCheckbox.checked = false; // Or true, depending on UX preference for indeterminate
                    listHeaderCheckbox.indeterminate = true;
                }
            }
        }
    }

    // --- Event Listeners for Bulk Action Bar Buttons ---
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const allVisibleCheckboxes = itemsDisplayArea.querySelectorAll('.file-item input[type="checkbox"]');
            const shouldSelectAll = selectAllBtn.textContent === 'Select all'; 
            
            allVisibleCheckboxes.forEach(checkbox => {
                checkbox.checked = shouldSelectAll;
                const itemElement = checkbox.closest('.file-item');
                if (itemElement && itemElement.dataset.name) {
                    if (shouldSelectAll) {
                        selectedItems.add(itemElement.dataset.name);
                    } else {
                        selectedItems.delete(itemElement.dataset.name);
                    }
                }
            });
            // Ενημέρωση και του listHeaderCheckbox αν είναι ορατό
            if (listHeaderCheckbox && itemsDisplayArea.classList.contains('list-view')) {
                listHeaderCheckbox.checked = shouldSelectAll;
            }
            updateUIOnSelectionChange();
        });
    }

    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', () => {
            const allVisibleCheckboxes = itemsDisplayArea.querySelectorAll('.file-item input[type="checkbox"]');
            allVisibleCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            selectedItems.clear();
            // Αποεπιλογή και του listHeaderCheckbox αν είναι ορατό
            if (listHeaderCheckbox && itemsDisplayArea.classList.contains('list-view')) {
                listHeaderCheckbox.checked = false;
            }
            updateUIOnSelectionChange();
        });
    }

    if (bulkMoveBtn) {
        bulkMoveBtn.addEventListener('click', () => {
            if (selectedItems.size > 0) {
                alert(`TODO: Implement Move for ${selectedItems.size} items: ${Array.from(selectedItems).join(', ')}`);
                // After moving, clear selection
                // clearSelectionBtn.click(); // Or call the logic directly
            }
        });
    }

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', () => {
            if (selectedItems.size === 0) return;

            if (confirm(`Are you sure you want to delete ${selectedItems.size} selected item(s)?`)) {
                selectedItems.forEach(itemName => {
                    const itemElement = itemsDisplayArea.querySelector(`.file-item[data-name="${itemName}"]`);
                    if (itemElement) {
                        itemElement.remove();
                    }
                });
                selectedItems.clear();
                updateCounts(); // Update folder/product counts
                updateUIOnSelectionChange(); // Hide bar and reset states
                console.log('Bulk delete completed.');
            }
        });
    }

    // --- Event Listener for List Header Checkbox ---
    if (listHeaderCheckbox) {
        listHeaderCheckbox.addEventListener('click', () => {
            // Αυτό το checkbox επηρεάζει μόνο τα ορατά items στην list-view.
            // Η λειτουργία του selectAllBtn της μπάρας είναι πιο γενική.
            if (!itemsDisplayArea.classList.contains('list-view')) return;

            const allListItemCheckboxes = itemsDisplayArea.querySelectorAll('.file-item input[type="checkbox"]');
            const isChecked = listHeaderCheckbox.checked;

            allListItemCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                const itemElement = checkbox.closest('.file-item');
                if (itemElement && itemElement.dataset.name) {
                    if (isChecked) {
                        selectedItems.add(itemElement.dataset.name);
                    } else {
                        selectedItems.delete(itemElement.dataset.name);
                    }
                }
            });
            updateUIOnSelectionChange();
        });
    }

    // Initial setup
    updatePathDisplay();
    updateCounts();
    updateUIOnSelectionChange(); // Initial call to set the bulk actions bar state (should be hidden)
}); 