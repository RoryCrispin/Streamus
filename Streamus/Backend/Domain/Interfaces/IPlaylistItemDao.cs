﻿using System;

namespace Streamus.Backend.Domain.Interfaces
{
    public interface IPlaylistItemDao : IDao<PlaylistItem>
    {
        PlaylistItem Get(Guid playlistId, Guid id);
    }
}