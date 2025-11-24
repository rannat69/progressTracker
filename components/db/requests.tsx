"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllRequests() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("requests").select(`
    *,
    teams (
      *
    ),
    requests_items (
      *
    )
  `);

  if (error) {
    console.error("Error fetching requests:", error);
    return null; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function getAllRequestItemsForRequest(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests_items")
    .select(
      `
    *`
    )
    .eq("id", id);

  if (error) {
    console.error("Error fetching request items:", error);
    return null; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function createRequest(
  cost: any,
  date: any,
  team: any,
  title: any,
  desc: any,
  role: any,
  author: any
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .insert([
      {
        cost: cost,
        date: date,
        team_id: team,
        title: title,
        description: desc,
        status: "Pending",
        request_author_type: role,
        request_author_id: author,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating team:", error);
    return error; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function createRequestItems(requestId: string, items: any) {
  const supabase = await createClient();

  const datas = [];

  for (const item of items) {
    const { data, error } = await supabase
      .from("requests_items")
      .insert([
        {
          request_id: requestId,
          cost: item.cost,
          item_name: item.title,
          item_description: item.description,
          link: item.link,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating request item:", error);
      return error; // Handle the error as needed
    }

    datas.push(data);
  }

  if (datas && datas.length > 0) {
    return datas;
  } else {
    return null;
  }
}

export async function updateRequestStatus(id: any, email: any, status: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .update({ status: status,  })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating request status:", error);
    return error; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
