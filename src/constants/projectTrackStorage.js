import { folderHasProjectTracks } from './projectsPanelTree';
import { getFreshFifteenTracksForFolder } from './freshFifteenTracks';
import { getMoreLikeTracksForFolder } from './moreLikeTracks';
import { getMilanUpdatesTracksForFolder } from './milanUpdatesTracks';

/** Default static track list for a folder (null when folder cannot hold tracks). */
export function getDefaultFolderTracks(folderId, mergedProjects) {
  if (!folderHasProjectTracks(folderId)) return null;
  const milanUpdatesTracks = getMilanUpdatesTracksForFolder(folderId);
  if (milanUpdatesTracks) return milanUpdatesTracks;
  const freshFifteenTracks = getFreshFifteenTracksForFolder(folderId);
  if (freshFifteenTracks) return freshFifteenTracks;
  const moreLikeTracks = getMoreLikeTracksForFolder(folderId);
  if (moreLikeTracks) return moreLikeTracks;
  return mergedProjects;
}

/** Resolved tracks for a folder, applying move overrides when present. */
export function resolveFolderTracks(folderId, folderTrackOverrides, mergedProjects) {
  if (folderTrackOverrides[folderId]) return folderTrackOverrides[folderId];
  return getDefaultFolderTracks(folderId, mergedProjects) ?? [];
}

export function canDropTrackOnFolder(targetFolderId, sourceFolderId) {
  if (!targetFolderId || targetFolderId === sourceFolderId) return false;
  return folderHasProjectTracks(targetFolderId);
}

function renumberTracks(tracks) {
  return tracks.map((track, index) => ({ ...track, num: index + 1 }));
}

/** Reorder tracks within a folder; returns updated overrides map. */
export function reorderFolderTracks({
  folderId,
  fromIndex,
  toIndex,
  folderTrackOverrides,
  mergedProjects,
}) {
  const tracks = [...resolveFolderTracks(folderId, folderTrackOverrides, mergedProjects)];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= tracks.length ||
    toIndex >= tracks.length ||
    fromIndex === toIndex
  ) {
    return folderTrackOverrides;
  }
  const [moved] = tracks.splice(fromIndex, 1);
  tracks.splice(toIndex, 0, moved);
  return {
    ...folderTrackOverrides,
    [folderId]: renumberTracks(tracks),
  };
}

/** Reorder one or more selected tracks to a new position within a folder. */
export function reorderFolderTracksSelection({
  folderId,
  activeId,
  overId,
  selectedIds,
  folderTrackOverrides,
  mergedProjects,
}) {
  if (!activeId || !overId || activeId === overId) {
    return folderTrackOverrides;
  }

  const tracks = [...resolveFolderTracks(folderId, folderTrackOverrides, mergedProjects)];
  const selectedSet = new Set(selectedIds);
  const movingBlock = tracks.filter(
    (track) => selectedSet.has(track.id) || track.id === activeId
  );
  const movingSet = new Set(movingBlock.map((track) => track.id));

  if (movingSet.has(overId)) {
    return folderTrackOverrides;
  }

  const activeIndex = tracks.findIndex((track) => track.id === activeId);
  const overIndex = tracks.findIndex((track) => track.id === overId);
  if (activeIndex < 0 || overIndex < 0) {
    return folderTrackOverrides;
  }

  const remaining = tracks.filter((track) => !movingSet.has(track.id));
  let insertIndex = remaining.findIndex((track) => track.id === overId);
  if (insertIndex < 0) insertIndex = remaining.length;
  if (activeIndex < overIndex) insertIndex += 1;

  const next = [...remaining];
  next.splice(insertIndex, 0, ...movingBlock);

  return {
    ...folderTrackOverrides,
    [folderId]: renumberTracks(next),
  };
}

/** Move one track from source folder to target; returns updated overrides map. */
export function moveTrackBetweenFolders({
  track,
  sourceFolderId,
  targetFolderId,
  folderTrackOverrides,
  mergedProjects,
}) {
  const sourceTracks = renumberTracks(
    resolveFolderTracks(sourceFolderId, folderTrackOverrides, mergedProjects).filter(
      (item) => item.id !== track.id
    )
  );
  const targetTracks = renumberTracks([
    ...resolveFolderTracks(targetFolderId, folderTrackOverrides, mergedProjects),
    { ...track, folderId: targetFolderId },
  ]);

  return {
    ...folderTrackOverrides,
    [sourceFolderId]: sourceTracks,
    [targetFolderId]: targetTracks,
  };
}

/** Bump `trackCount` on folder nodes after a track move. */
export function adjustFolderTreeTrackCounts(tree, sourceFolderId, targetFolderId) {
  function walk(nodes) {
    return nodes.map((node) => {
      let next = node;
      if (node.id === sourceFolderId && node.trackCount != null) {
        next = { ...next, trackCount: Math.max(0, node.trackCount - 1) };
      }
      if (node.id === targetFolderId) {
        const base = node.trackCount ?? 0;
        next = { ...next, trackCount: base + 1 };
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        next = { ...next, children: walk(node.children) };
      }
      return next;
    });
  }
  return walk(tree);
}
