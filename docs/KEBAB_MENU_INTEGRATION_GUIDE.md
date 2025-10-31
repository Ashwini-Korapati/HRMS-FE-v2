# Kebab Menu Integration Guide

## Overview

The kebab menu system provides folder-level actions in the project management interface. It includes intelligent positioning, no scrolling overflow, and popover-based dialogs for each action.

## Components Structure

```
/components/Kebab/
├── KebabMenu.jsx              # Main dropdown menu coordinator
├── KebabOverlay.jsx           # Portal-based overlay container
├── AddSubfolderPopover.jsx    # Create subfolder dialog
├── UploadFilesPopover.jsx     # File upload dialog
├── RenameFolderPopover.jsx    # Rename dialog
├── DeleteFolderConfirm.jsx    # Delete confirmation
├── MoveFolderPopover.jsx      # Move/relocate dialog
├── ShareFolderPopover.jsx     # Share/permissions dialog
├── ViewDetailsPopover.jsx     # Folder metadata display
└── DownloadAllPopover.jsx     # ZIP download preparation
```

## Redux Integration

**File**: `Redux/Public/kebabActionsSlice.js`

### Async Thunks

1. **`executeKebabAction`** - Execute single folder action
   - Params: `{ action, projectId, folderId, payload }`
   - Returns: Action result with updated folder data

2. **`getActionDetails`** - Fetch metadata for action dialogs
   - Params: `{ action, projectId, folderId }`
   - Returns: Action-specific details (destinations, permissions, etc.)

3. **`bulkExecuteKebabActions`** - Execute action on multiple folders
   - Params: `{ action, projectId, folderIds, payload }`
   - Returns: Bulk operation results

### Selectors

```javascript
// Main state selectors
selectKebabLoading         // 'idle' | 'loading' | 'succeeded' | 'failed'
selectKebabError           // Error message if failed
selectKebabDetails         // Action metadata (destinations, recipients, etc.)
selectKebabLastAction      // Last executed action ID
selectKebabLastActionResult // Last action result
selectKebabHistory         // Recent actions for undo/redo
```

## Usage in Components

### Basic Integration (UserProjectList / ProjectsListPage)

The kebab menu is already integrated in the folder tree nodes. Simply ensure:

1. **Folder object has required fields**:
   ```javascript
   {
     id: string,              // Unique folder ID (required)
     urn: string,             // Uniform Resource Name
     name: string,            // Display name
     path: string,            // Full folder path
     createdById: string,     // Owner's user ID
     permissions: Array,      // FolderPermission rows
     permissionActions: Array, // ['view', 'upload', 'download', 'share', 'delete']
     children: Array,         // Nested folders
     kebabActions: Array      // Available actions from backend
   }
   ```

2. **Project object has required fields**:
   ```javascript
   {
     id: string,              // Unique project ID (required)
     name: string,
     // ... other fields
   }
   ```

3. **Pass props to KebabMenu**:
   ```jsx
   <KebabMenu
     folder={folder}
     projectId={project?.id}
     onActionComplete={handleActionComplete}
     userRole={userRole}  // 'ADMIN', 'USER', 'IT', 'SUPER_ADMIN'
     currentUserPermissions={folder.permissionActions || []}
   />
   ```

### Example Implementation

```jsx
function FolderTreeNode({ folder, project, userRole = 'USER' }) {
  const handleActionComplete = (actionId, result) => {
    console.log(`Action ${actionId} completed:`, result)
    // Optionally refresh folder tree or update UI
  }

  return (
    <div className="flex items-center gap-1 group">
      <button onClick={() => handleFolderClick(folder)}>
        {folder.name}
      </button>
      
      {/* Kebab menu appears on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <KebabMenu
          folder={folder}
          projectId={project?.id}
          onActionComplete={handleActionComplete}
          userRole={userRole}
          currentUserPermissions={folder.permissionActions || []}
        />
      </div>
    </div>
  )
}
```

## Session Requirements

**Critical**: The kebab actions require `companyId` in localStorage:

```javascript
// This must be set during authentication/login
localStorage.setItem('companyId', company_uuid)
```

If this is missing, you'll see error: `"Company ID not found in session"`

## Backend API Endpoints

All kebab actions communicate with these endpoints:

### Execute Single Action
```
POST /:companyId/kebab-actions/:projectId/:folderId
Body: { action, payload }
```

**Supported Actions**:
- `add_subfolder` - Create new subfolder
- `upload_files` - Upload documents to folder
- `rename` - Rename folder
- `delete` - Soft delete folder
- `move` - Move folder to new parent
- `copy` - Copy folder to destination
- `share` - Share folder with roles
- `view_details` - Get folder metadata
- `download_all` - Prepare ZIP download

### Get Action Details
```
GET /:companyId/kebab-actions/:projectId/:folderId/details?action=:action
```

Returns action-specific metadata:
- For `share`: Available roles, current permissions
- For `move`: Valid destination folders
- For `delete`: File/subfolder counts, soft-delete info
- For `view_details`: Complete folder metadata

### Bulk Operations
```
POST /:companyId/kebab-actions/:projectId/bulk
Body: { action, folderIds: [...], payload }
```

## Permission Model

The kebab menu filters actions based on user permissions:

```javascript
// Permission checks (in order):
1. Is user the folder owner? → All actions allowed
2. Is user ADMIN/IT/SUPER_ADMIN? → All actions allowed
3. Does user have permission for this action? → Action shown
4. Otherwise → Action hidden
```

**Permission to Action Mapping**:
```javascript
'view'     → view_details
'upload'   → add_subfolder, upload_files, rename, move, copy
'share'    → share
'download' → download_all
'delete'   → delete (owners/admins only)
```

## Error Handling

Each popover has built-in error handling. Errors are caught and displayed in the UI:

```jsx
// In each popover component:
try {
  await dispatch(executeKebabAction({...})).unwrap()
  onSuccess?.(result)
  onClose()
} catch (err) {
  setError(err || 'Action failed')
  // Error displays in the popover
}
```

## Common Issues & Solutions

### Issue: "Company ID not found in session"
**Solution**: Ensure `companyId` is stored in localStorage after login:
```javascript
localStorage.setItem('companyId', authResponse.companyId)
```

### Issue: Menu is scrolling/overflowing
**Solution**: The menu now has intelligent positioning and no max-height scrolling. If still occurring:
1. Check browser zoom level (should be 100%)
2. Verify viewport has enough space
3. Check for CSS conflicts with `max-height` on parent containers

### Issue: Popovers not appearing
**Solution**: 
1. Verify folder has `id` field
2. Ensure `projectId` is passed correctly
3. Check browser console for error messages
4. Verify folder has appropriate permissions

### Issue: "Missing required parameters" error
**Solution**: Check that:
1. `folder.id` is defined and not null/empty
2. `projectId` is passed to KebabMenu
3. `companyId` is in localStorage
4. Action being called exists in backend

## Testing Checklist

- [ ] Click kebab menu button - dropdown appears without scrolling
- [ ] Menu positions correctly (top/bottom based on space)
- [ ] Click action - popover opens and menu closes
- [ ] Fill form - submit sends request to backend
- [ ] Success - folder updates and popover closes
- [ ] Error - error message displays in popover
- [ ] Escape key - popover closes
- [ ] Click outside - popover closes
- [ ] Different user roles - different actions shown
- [ ] Permission validation - non-authorized users can't access actions

## Performance Considerations

1. **Menu Positioning**: Calculated on open, not on every render
2. **Permission Filtering**: Done in-component, not in Redux
3. **API Calls**: Lazy - only called when action is executed
4. **Popovers**: Conditionally rendered only when active

## Future Enhancements

- [ ] Undo/Redo support (history tracking in Redux)
- [ ] Batch operations UI
- [ ] Action shortcuts (keyboard)
- [ ] Custom action templates
- [ ] Action audit logging
- [ ] Conflict resolution for simultaneous actions

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Review Redux DevTools for action history
3. Verify backend API responses with Network tab
4. Check folder object structure matches schema

