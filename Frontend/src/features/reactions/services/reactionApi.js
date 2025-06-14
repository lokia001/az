// src/features/reactions/services/reactionApi.js
import apiClient from '../../../services/apiClient'; // Adjust path

const extractErrorMessage = (error, defaultMessage) => {
    let message = defaultMessage;
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData.message === 'string') message = errorData.message;
        else if (typeof errorData.title === 'string') message = errorData.title;
        else if (typeof errorData.error === 'string') message = errorData.error;
        else if (typeof errorData === 'string') message = errorData;
        else { message = JSON.stringify(errorData); }
    } else if (error.message) {
        message = error.message;
    }
    console.error('[ReactionApiService] Extracted error message:', message, 'Original error status:', error.response?.status);
    return message;
};

/**
 * API: Set/Toggle a reaction on a target entity.
 * @param {object} reactionData - { targetEntityType, targetEntityId, reactionType }
 * @returns {Promise<object>} ReactionSummaryDto
 */
export const setReactionAPI = async (reactionData) => {
    const { targetEntityType, targetEntityId, reactionType } = reactionData;
    if (!targetEntityType || !targetEntityId || !reactionType) {
        throw new Error("Target entity type, ID, and reaction type are required.");
    }
    const payload = { targetEntityType, targetEntityId, reactionType };
    const endpoint = '/api/reactions'; // POST /reactions
    console.log(`[ReactionApiService] Calling POST ${endpoint} with payload:`, payload);
    try {
        const response = await apiClient.post(endpoint, payload);
        return response.data; // Expected: ReactionSummaryDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to set reaction.'));
    }
};

/**
 * API: Remove a reaction from a target entity.
 * @param {object} reactionData - { targetEntityType, targetEntityId, reactionTypeToRemove (optional) }
 * @returns {Promise<object>} ReactionSummaryDto
 */
export const removeReactionAPI = async (reactionData) => {
    const { targetEntityType, targetEntityId, reactionTypeToRemove } = reactionData;
    if (!targetEntityType || !targetEntityId) {
        throw new Error("Target entity type and ID are required to remove a reaction.");
    }
    // The API expects a request body for DELETE /reactions
    const payload = { targetEntityType, targetEntityId, reactionTypeToRemove: reactionTypeToRemove || null };
    const endpoint = '/api/reactions'; // DELETE /reactions
    console.log(`[ReactionApiService] Calling DELETE ${endpoint} with payload:`, payload);
    try {
        // Axios DELETE requests can have a data payload in the config
        const response = await apiClient.delete(endpoint, { data: payload });
        return response.data; // Expected: ReactionSummaryDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to remove reaction.'));
    }
};

/**
 * API: Get reaction summary for a target entity.
 * @param {string} targetEntityTypeString
 * @param {string} targetId
 * @returns {Promise<object>} ReactionSummaryDto
 */
export const fetchReactionSummaryAPI = async (targetEntityTypeString, targetId) => {
    if (!targetEntityTypeString || !targetId) {
        throw new Error("Target entity type and ID are required to fetch reaction summary.");
    }
    const endpoint = `/api/entities/${targetEntityTypeString}/${targetId}/reactions/summary`;
    console.log(`[ReactionApiService] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // Expected: ReactionSummaryDto
    } catch (error) {
        // If 404, it might mean no reactions yet, return a default summary
        if (error.response && error.response.status === 404) {
            console.warn(`[ReactionApiService] No reaction summary found for ${targetEntityTypeString}/${targetId}. Returning default.`);
            return {
                targetEntityId: targetId,
                targetEntityType: targetEntityTypeString,
                counts: {},
                currentUserReactionType: null
            };
        }
        throw new Error(extractErrorMessage(error, `Failed to fetch reaction summary for ${targetEntityTypeString} ${targetId}.`));
    }
};